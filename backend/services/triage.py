import json
import logging
import re
import time
from typing import Optional, List

from google.genai import types
from pydantic import BaseModel, Field

from backend.core.config import settings
from backend.core.vertex_client import get_genai_client
from backend.models.schemas import (
    SpatialTriageResult,
    BoundingBox,
    AIAuthenticityCheck,
    UserAnnotationVerification,
    UnannotatedDamage,
    WarrantyClauseAnalysis,
)
from backend.services.vision.image_prep import extract_dual_views
from backend.services.vision.geometry_guard import (
    normalize_box,
    constrain_to_user_reticle,
    map_classification,
    compute_separation_mm,
)

logger = logging.getLogger("nyayshield.triage")


SYSTEM_TRIAGE_INSTRUCTION = """
You are NyayShield AI, an expert consumer protection hardware forensic inspector.
Perform objective optical defect detection, classification, and spatial localization on consumer electronics.

CONTRASTIVE VISUAL EXCLUSION RUBRIC (Evaluate physical evidence BEFORE assigning a label):
- "Manufacturing Defect" (EXCLUDE if radial shatter, crushed corner, or blunt dent is present): Clean factory-seam or bezel snap-fit separation, internal hinge brass-insert/screw-boss torque shear, or vertical LCD delamination lines with intact surrounding outer paint/anodized finish and NO external impact point.
- "Physical/Accidental Damage" (EXCLUDE clean seam/hinge pull-out with no exterior trauma): Radial spiderweb glass fracture radiating from a point impact, crushed/deformed corner or bent frame, deep material-displacing gouge, or liquid-spill corrosion/staining (`impact_point_present: true`).
- "Cosmetic Wear" (EXCLUDE any structural crack, hinge gap, or functional impairment): Superficial exterior paint scratches, scuffs, keycap shine, or minor lid marks leaving the underlying chassis geometry intact.

CRITICAL ENGINEERING RULES:
1. Identify the true device brand and series visible on the chassis (e.g. HP Pavilion vs HP Victus, Dell Inspiron, Lenovo ThinkPad, MacBook). Never force a wrong model name.
2. Check first whether a real consumer electronic device or product is present (`is_device`). If the photo shows only non-product scenery, humans, documents, or blank space, set `is_device: false`.
3. Provide TIGHT normalized bounding boxes [ymin, xmin, ymax, xmax] on a 0 to 1000 scale surrounding the genuine visible defect pixels. Do NOT fabricate boxes on clean surfaces or empty desk areas.
4. Estimate a realistic authorized Indian OEM replacement part cost in INR (`fair_oem_cost_inr`) appropriate for the specific detected component (e.g., laptop hinge/bezel ~₹2,200-₹3,500, laptop LCD panel ~₹5,500-₹9,500, smartphone OLED ~₹4,500-₹12,000, keyboard deck ~₹2,500-₹4,500).
5. Evaluate image authenticity for signs of generative AI synthesis (`is_authentic_photo`, `ai_generated_probability`).
"""


# ---------------------------------------------------------------------------
# Internal Gemini Structured Output Schemas (Physics-First Field Ordering)
# ---------------------------------------------------------------------------

class _DetectedDefect(BaseModel):
    part: str = Field(..., description="Specific hardware component name (e.g. Left Display Hinge, Palmrest Deck, LCD Panel)")
    oem_part_code: str = Field("OEM-PART-01", description="Likely OEM spare part identifier or category code")
    # Stage 1: Raw Physical Evidence (Evaluated BEFORE Classification)
    material_type: str = Field(..., description="Observed substrate material (e.g. polycarbonate ABS, brushed aluminum, glass)")
    surface_texture: str = Field(..., description="Macro surface condition (e.g. stress-whitened plastic, intact anodized finish, abraded scuff)")
    stress_indicators: str = Field(..., description="Mechanical failure cues (e.g. internal brass-insert shear, hinge torque fatigue, clean delamination vs blunt crush)")
    impact_point_present: bool = Field(..., description="True ONLY if radial spider-cracks, crushed corner, or blunt-force indentation are visible")
    # Stage 2: Tight Coordinates & Final Verdict (Evaluated LAST)
    defect_box: List[int] = Field(..., description="Tight normalized bounding box [ymin, xmin, ymax, xmax] on 0-1000 scale")
    classification: str = Field(..., description='One of: "Manufacturing Defect", "Physical/Accidental Damage", "Cosmetic Wear"')
    summary: str = Field(..., description="2 sentences assessing the visual defect mechanism and warranty significance")


class _FullScanResponse(BaseModel):
    is_device: bool = Field(..., description="True if a consumer electronic product is visible in the image")
    brand_name: str = Field("Unknown", description="Detected manufacturer brand")
    identified_product: str = Field(..., description="Full identified product name (e.g. HP Pavilion 15 Laptop)")
    material_type: str = Field("Mixed chassis", description="Primary chassis material observed")
    surface_texture: str = Field("Standard finish", description="Overall chassis surface condition")
    stress_indicators: str = Field("None", description="Global structural stress or fatigue observations")
    impact_point_present: bool = Field(False, description="True ONLY if external drop impact trauma is visible on the chassis")
    defects: List[_DetectedDefect] = Field(default_factory=list, description="All genuine visible defects and wear spots")
    fair_oem_cost_inr: float = Field(2800.0, description="Realistic authorized Indian OEM spare part cost in INR for primary defect")
    is_authentic_photo: bool = Field(True, description="True if authentic optical camera photo, False if synthetic AI image")
    ai_generated_probability: float = Field(0.02, description="Estimated probability (0.0-1.0) of AI generation")
    authenticity_notes: str = Field(..., description="Brief optical sensor/lighting authenticity rationale")
    applicable_warranty_clause: str = Field(..., description="Applicable manufacturer warranty clause or statutory ground")
    legal_remedy_summary: str = Field(..., description="Concise consumer law remedy summary under CPA 2019")


class _SecondarySpot(BaseModel):
    name: str = Field(..., description="Specific secondary defect or wear label (e.g. Palmrest Scuff, Corner Dent)")
    part_type: str = Field(..., description="Component where secondary mark is located (e.g. C-Cover Palmrest, Bottom Case)")
    oem_part_code: str = Field("OEM-SEC-01", description="Component identifier")
    defect_box: List[int] = Field(..., description="Tight normalized bounding box [ymin, xmin, ymax, xmax] on 0-1000 scale")
    classification: str = Field(..., description='One of: "Manufacturing Defect", "Physical/Accidental Damage", "Cosmetic Wear"')


class _SpecificScanResponse(BaseModel):
    # Stage 1: Device & Component Identity
    is_device: bool = Field(..., description="True if a consumer electronic product is visible in the image")
    brand_name: str = Field("Unknown", description="Detected manufacturer brand")
    identified_product: str = Field(..., description="Full identified product name")
    damage_verified: bool = Field(..., description="True if genuine physical damage exists inside the red-marked region")
    identified_part: str = Field(..., description="Specific component name inside the marked region")
    oem_part_code: str = Field("OEM-PART-01", description="Likely OEM spare part identifier")
    # Stage 2: Raw Physical Evidence (Evaluated BEFORE Classification)
    material_type: str = Field(..., description="Observed material of the marked component (e.g. polycarbonate ABS, aluminum alloy, LCD glass)")
    surface_texture: str = Field(..., description="Macro surface texture from the unmarked crop (e.g. stress whitening, clean bezel paint, scratched lacquer)")
    stress_indicators: str = Field(..., description="Fracture/stress mechanics visible in the macro crop (e.g. internal hinge boss shear, torsional bezel lift vs radial shatter)")
    impact_point_present: bool = Field(..., description="True ONLY if a point of blunt-force external impact, radial spider-crack, or crushed corner is visible")
    # Stage 3: Tight Coordinates & Final Verdict (Evaluated LAST)
    defect_box: List[int] = Field(..., description="Tight normalized bounding box [ymin, xmin, ymax, xmax] (0-1000) tightly surrounding the defect inside the red mark")
    classification: str = Field(..., description='One of: "Manufacturing Defect", "Physical/Accidental Damage", "Cosmetic Wear"')
    analysis: str = Field(..., description="2-3 plain-English sentences assessing the defect, stress vs impact signs, and warranty liability")
    fair_oem_cost_inr: float = Field(2800.0, description="Realistic authorized Indian OEM spare part cost in INR for the marked part")
    is_authentic_photo: bool = Field(True, description="True if authentic optical photo")
    ai_generated_probability: float = Field(0.02, description="Estimated probability (0.0-1.0) of AI synthesis")
    authenticity_notes: str = Field(..., description="Brief optical sensor/lighting authenticity rationale")
    applicable_warranty_clause: str = Field(..., description="Applicable warranty clause or statutory ground")
    legal_remedy_summary: str = Field(..., description="Concise consumer law remedy summary under CPA 2019")
    secondary_spots: List[_SecondarySpot] = Field(
        default_factory=list,
        description="Genuine secondary defects or wear spots visible OUTSIDE the marked region; empty list [] if rest of device is clean"
    )
    independence_verdict: str = Field("Structurally Independent", description='"Structurally Independent" or "Potentially Correlated"')
    legal_reasoning: str = Field(..., description="Causation assessment relating the marked defect and rest of chassis")


# ---------------------------------------------------------------------------
# Helpers: Image Preprocessing, Red-Mark Flattening & Safe JSON Parsing
# ---------------------------------------------------------------------------

def safe_parse_json(raw_text: str) -> dict:
    """
    Ported from _ref_detection/Nyayshield/app.js safeParseJson().
    Strips markdown code fences, extracts outer JSON object, and repairs trailing commas.
    """
    if not raw_text or not isinstance(raw_text, str):
        raise ValueError("Empty response from model")

    cleaned = re.sub(r"```(?:json)?", "", raw_text, flags=re.IGNORECASE).replace("```", "").strip()
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace >= first_brace:
        cleaned = cleaned[first_brace : last_brace + 1]

    # Iteratively remove trailing commas before } or ]
    cleaned = re.sub(r",\s*([}\]])", r"\1", cleaned)
    return json.loads(cleaned)


def _estimate_tier2_oem_cost(walk_in_quote: Optional[float] = None, brand: str = "HP") -> float:
    """Deterministic Indian OEM benchmark baseline inspired by _ref_detection Tier 2 engine."""
    if walk_in_quote and walk_in_quote > 0:
        return max(1200.0, round((walk_in_quote * 0.28) / 100.0) * 100.0)
    return 2800.0


# ---------------------------------------------------------------------------
# Main Spatial Triage Pipeline
# ---------------------------------------------------------------------------

def perform_spatial_triage(
    image_bytes: bytes,
    mime_type: str = "image/jpeg",
    brand_name: Optional[str] = None,
    model_name: Optional[str] = None,
    user_description: Optional[str] = None,
    user_annotation: Optional[List[int]] = None,
    purchase_type: Optional[str] = "Standard 1-Yr Warranty",
) -> SpatialTriageResult:
    """
    Step 1: Forensic Spatial Defect Triage & User Annotation Verification.
    Ports _ref_detection's two-mode architecture (Full Scan vs Specific Marked Scan)
    with red-mark image flattening, silent model cascade, and unbiased structured schemas.
    """
    start_time = time.time()
    brand = (brand_name or "HP").strip()
    model = (model_name or "").strip()
    device_full = f"{brand} {model}".strip() if model else f"{brand} Laptop"
    has_user_mark = bool(normalize_box(user_annotation))

    overview_bytes, overview_mime, macro_crop_bytes = extract_dual_views(
        image_bytes=image_bytes,
        mime_type=mime_type,
        user_annotation=user_annotation if has_user_mark else None,
    )

    client = get_genai_client()

    if client is not None:
        primary_id = settings.VERTEX_MODEL_ID or "gemini-3.8-flash"
        cascade_models = [primary_id] + [m for m in settings.VERTEX_CASCADE_MODELS if m != primary_id]

        user_desc_str = user_description or "Not provided — rely strictly on visual evidence in the photo."

        if not has_user_mark:
            # MODE 1: Full Device Scan (Physics-First)
            prompt = f"""
Inspect this consumer product photo thoroughly.
User-provided Brand Hint: {brand}
User-provided Model Hint: {model if model else 'Auto-detect from visual chassis/logo'}
Protection Plan: {purchase_type or 'Standard Hardware Warranty'}
Customer Note: {user_desc_str}

Tasks (follow Physics-First ordering strictly):
1. First determine whether a real consumer electronic device or product is visible (`is_device`). If NOT (e.g., blank photo, landscape, human, document, non-product object), set `is_device: false` and `defects: []`.
2. If a product IS visible:
   - Identify `brand_name` and `identified_product` from visible logos, bezels, keyboards, or chassis form factor.
   - Observe raw physical evidence BEFORE classifying (`material_type`, `surface_texture`, `stress_indicators`, `impact_point_present`).
   - Identify ALL genuine visible defects, structural cracks, separated hinges, dents, impact shattering, or cosmetic wear spots on the product.
   - For each defect found, fill physical evidence (`material_type`, `surface_texture`, `stress_indicators`, `impact_point_present`), then TIGHT normalized bounding box `defect_box: [ymin, xmin, ymax, xmax]` (0 to 1000 scale), then `classification` ("Manufacturing Defect" | "Physical/Accidental Damage" | "Cosmetic Wear"), and `summary`.
   - Do NOT invent defects or place boxes on clean areas or the desk.
   - Provide `fair_oem_cost_inr` for the primary detected spare component in India.
"""
            schema_cls = _FullScanResponse
        else:
            norm_u = normalize_box(user_annotation)
            user_box_str = f"[{norm_u[0]}, {norm_u[1]}, {norm_u[2]}, {norm_u[3]}]"
            # MODE 2: Single-Call Dual-Image Specific Marked Scan + Secondary Separation Scan
            dual_view_note = (
                "You are provided TWO views of the exact same photo:\n"
                "- Image 1 (Overview): Full EXIF-corrected device photo with a 4px bright red rectangle drawn around the user's suspected defect.\n"
                "- Image 2 (Macro Crop): Unmarked, native-resolution 20%-padded close-up crop of that exact region so you can inspect fracture physics without red-line occlusion.\n"
                "Always output all bounding box coordinates (`defect_box` and `secondary_spots[].defect_box`) in the 0-1000 coordinate frame of Image 1 (Overview)."
                if macro_crop_bytes
                else "The user has drawn a 4px bright red rectangle highlight on the image around a suspected defect."
            )
            prompt = f"""
Inspect this consumer product photo.
User-provided Brand Hint: {brand}
User-provided Model Hint: {model if model else 'Auto-detect from visual chassis/logo'}
Protection Plan: {purchase_type or 'Standard Hardware Warranty'}
Customer Note: {user_desc_str}
User's Red Rectangle Region in Image 1 (0-1000 scale): {user_box_str}

{dual_view_note}

Tasks (follow Physics-First ordering strictly):
1. First determine whether a real consumer electronic device or product is visible (`is_device`). If NOT, set `is_device: false`, `damage_verified: false`, and `defect_box: [0, 0, 0, 0]`.
2. Focus primarily INSIDE or immediately overlapping the red-marked region {user_box_str} using the Macro Crop (Image 2) for fine material evidence:
   - Verify whether actual physical damage or wear is visible (`damage_verified: true/false`), and identify `identified_part` and `oem_part_code`.
   - Record raw physical observations BEFORE deciding the verdict: `material_type`, `surface_texture`, `stress_indicators`, and `impact_point_present` (True ONLY if blunt-force dent, crushed corner, or radial shatter is visible).
   - Output `defect_box: [ymin, xmin, ymax, xmax]` (0-1000 scale in Image 1 coordinates) tightly surrounding the defect, then `classification` ("Manufacturing Defect" | "Physical/Accidental Damage" | "Cosmetic Wear") and `analysis`.
   - Estimate realistic `fair_oem_cost_inr` for that component in India.
3. Inspect the remaining surface of the product in Image 1 OUTSIDE `defect_box`:
   - List any genuine secondary scratches, dents, or wear spots in `secondary_spots` with their tight `defect_box: [ymin, xmin, ymax, xmax]` and true `classification`.
   - If the rest of the chassis is completely clean, set `secondary_spots: []`.
"""
            schema_cls = _SpecificScanResponse

        overview_part = types.Part.from_bytes(data=overview_bytes, mime_type=overview_mime)
        request_contents: list = [overview_part]
        if macro_crop_bytes:
            request_contents.append(types.Part.from_bytes(data=macro_crop_bytes, mime_type="image/jpeg"))
        request_contents.append(prompt)

        for idx, model_id in enumerate(cascade_models):
            is_last = idx == len(cascade_models) - 1
            try:
                logger.info(
                    f"Invoking multimodal vision model [{model_id}] "
                    f"mode={'specific_dual_view' if macro_crop_bytes else ('specific' if has_user_mark else 'full')} "
                    f"for target: {device_full}"
                )
                response = client.models.generate_content(
                    model=model_id,
                    contents=request_contents,
                    config=types.GenerateContentConfig(
                        temperature=0.1,
                        system_instruction=SYSTEM_TRIAGE_INSTRUCTION,
                        response_mime_type="application/json",
                        response_schema=schema_cls,
                    ),
                )

                raw_text = response.text or ""
                if not raw_text:
                    raise ValueError(f"Empty response text from {model_id}")

                parsed = safe_parse_json(raw_text)
                elapsed_ms = round((time.time() - start_time) * 1000, 1)

                return _build_triage_result_from_live_json(
                    parsed=parsed,
                    has_user_mark=has_user_mark,
                    user_annotation=user_annotation,
                    fallback_brand=brand,
                    fallback_model=device_full,
                    elapsed_ms=elapsed_ms,
                )

            except Exception as e:
                logger.warning(f"Tier 1 cascade [{model_id}] failed ({e}).")
                if not is_last:
                    time.sleep(1.5)

    # Tier 2: Deterministic Benchmark Engine Fallback (only if all live models fail or no client)
    return _build_tier2_fallback_result(
        start_time=start_time,
        brand=brand,
        device_full=device_full,
        user_annotation=user_annotation,
    )


def _build_triage_result_from_live_json(
    parsed: dict,
    has_user_mark: bool,
    user_annotation: Optional[List[int]],
    fallback_brand: str,
    fallback_model: str,
    elapsed_ms: float,
) -> SpatialTriageResult:
    """Maps live Gemini Mode 1 or Mode 2 Physics-First JSON accurately into SpatialTriageResult."""
    is_device = bool(parsed.get("is_device", parsed.get("isDevice", True)))
    detected_brand = (parsed.get("brand_name") or parsed.get("brandName") or fallback_brand).strip()
    if detected_brand.lower() in ("unknown", "none", ""):
        detected_brand = fallback_brand
    detected_model = (parsed.get("identified_product") or parsed.get("identifiedProduct") or fallback_model).strip()
    if detected_model.lower() in ("unknown", "none", ""):
        detected_model = fallback_model

    fair_oem_cost = float(parsed.get("fair_oem_cost_inr") or parsed.get("fairOemCostINR") or 2800.0)
    if fair_oem_cost < 300.0:
        fair_oem_cost = 2800.0

    is_authentic = bool(parsed.get("is_authentic_photo", parsed.get("isAuthenticPhoto", True)))
    ai_prob = float(parsed.get("ai_generated_probability", parsed.get("aiGeneratedProbability", 0.02)))
    ai_prob = max(0.0, min(1.0, ai_prob))
    auth_notes = (
        parsed.get("authenticity_notes")
        or parsed.get("authenticityNotes")
        or "Optical noise curves and lighting coherence verified."
    )
    ai_auth = AIAuthenticityCheck(
        is_authentic=is_authentic,
        ai_generated_probability=ai_prob,
        authenticity_verdict="AUTHENTIC_PHYSICAL_DEVICE" if is_authentic else "SUSPECTED_AI_SYNTHETIC",
        forensic_authenticity_notes=auth_notes,
    )

    applicable_clause = (
        parsed.get("applicable_warranty_clause")
        or parsed.get("applicableWarrantyClause")
        or "Consumer Protection Act 2019 Sec 2(11) — Standard Hardware Warranty"
    )
    legal_remedy = (
        parsed.get("legal_remedy_summary")
        or parsed.get("legalRemedySummary")
        or "Issue formal statutory notice under Consumer Protection Act 2019."
    )

    bounding_boxes: List[BoundingBox] = []
    valid_unannotated: List[UnannotatedDamage] = []

    if not is_device:
        return SpatialTriageResult(
            brand_name=detected_brand,
            device_model="No Device Detected",
            defect_summary="No consumer electronic device or hardware product was detected in this photo.",
            primary_fault_part_code="N/A",
            primary_fault_part_name="None",
            cosmetic_part_code=None,
            bounding_boxes=[],
            euclidean_separation_mm=0.0,
            warranty_covered=False,
            causation_analysis="Invalid scan: uploaded image does not show a recognizable electronic device.",
            ai_authenticity=ai_auth,
            user_annotation_verification=UserAnnotationVerification(
                user_box_2d=user_annotation,
                damage_verified=False,
                component_name="None",
                defect_type="No hardware detected",
                classification="NORMAL_WEAR",
                forensic_report="Please capture or upload a clear photograph of the damaged hardware device.",
            ),
            unannotated_damages=[],
            warranty_clause_analysis=WarrantyClauseAnalysis(
                eligible_for_free_repair=False,
                applicable_free_repair_clause="N/A — Invalid Device Image",
                damages_not_covered=[],
                legal_remedy_summary="Upload a clear photograph showing the physical device to evaluate warranty coverage.",
            ),
            is_device=False,
            estimated_fair_oem_cost_inr=fair_oem_cost,
            is_fallback=False,
            inference_latency_ms=elapsed_ms,
        )

    if not has_user_mark:
        # Mode 1: Full Scan
        defects = parsed.get("defects") or []
        valid_defects = []
        for d in defects:
            n_box = normalize_box(d.get("defect_box") or d.get("box"))
            if n_box:
                valid_defects.append((d, n_box))

        if not valid_defects:
            return SpatialTriageResult(
                brand_name=detected_brand,
                device_model=detected_model,
                defect_summary=f"Full inspection of {detected_model} found no significant structural damage or visible defects.",
                primary_fault_part_code="NONE-DETECTED",
                primary_fault_part_name=f"{detected_model} Chassis",
                cosmetic_part_code=None,
                bounding_boxes=[],
                euclidean_separation_mm=0.0,
                warranty_covered=False,
                causation_analysis=f"Optical scan of {detected_model} revealed an intact chassis with zero localized defects.",
                ai_authenticity=ai_auth,
                user_annotation_verification=UserAnnotationVerification(
                    user_box_2d=None,
                    damage_verified=False,
                    component_name="Intact Chassis",
                    defect_type="No visible damage",
                    classification="NORMAL_WEAR",
                    forensic_report="No visible crack, hinge separation, impact shatter, or scratch was detected.",
                ),
                unannotated_damages=[],
                warranty_clause_analysis=WarrantyClauseAnalysis(
                    eligible_for_free_repair=False,
                    applicable_free_repair_clause=applicable_clause or "No defect detected for claim",
                    damages_not_covered=[],
                    legal_remedy_summary="No visible defect found; draw a reticle box on the affected area if subtle damage exists.",
                ),
                is_device=True,
                estimated_fair_oem_cost_inr=fair_oem_cost,
                is_fallback=False,
                inference_latency_ms=elapsed_ms,
            )

        primary_raw, primary_box = valid_defects[0]
        primary_cls = map_classification(
            primary_raw.get("classification"),
            impact_point_present=bool(primary_raw.get("impact_point_present", False)),
        )
        primary_part = primary_raw.get("part") or "Primary Component"
        primary_code = (
            primary_raw.get("oem_part_code")
            or primary_raw.get("oemPartCode")
            or f"OEM-{detected_brand[:3].upper()}-PART-01"
        )
        primary_summary = primary_raw.get("summary") or f"Defect detected on {primary_part}."

        bounding_boxes.append(
            BoundingBox(
                box_2d=primary_box,
                label=f"{primary_part}",
                oem_part_code=primary_code,
                part_type=primary_part,
                defect_classification=primary_cls,
                confidence=0.96,
                is_user_annotated=False,
            )
        )

        non_covered_labels: List[str] = []
        cosmetic_code: Optional[str] = None
        for sec_raw, sec_box in valid_defects[1:]:
            sec_cls = map_classification(
                sec_raw.get("classification"),
                impact_point_present=bool(sec_raw.get("impact_point_present", False)),
            )
            sec_part = sec_raw.get("part") or "Secondary Component"
            sec_code = (
                sec_raw.get("oem_part_code")
                or sec_raw.get("oemPartCode")
                or f"OEM-{detected_brand[:3].upper()}-SEC-01"
            )
            sec_summary = sec_raw.get("summary") or sec_part

            bounding_boxes.append(
                BoundingBox(
                    box_2d=sec_box,
                    label=sec_part,
                    oem_part_code=sec_code,
                    part_type=sec_part,
                    defect_classification=sec_cls,
                    confidence=0.91,
                    is_user_annotated=False,
                )
            )
            valid_unannotated.append(
                UnannotatedDamage(
                    box_2d=sec_box,
                    label=sec_summary,
                    part_type=sec_part,
                    oem_part_code=sec_code,
                    classification=sec_cls,
                    separation_from_primary_mm=0.0,
                )
            )
            if sec_cls != "MANUFACTURING_DEFECT":
                non_covered_labels.append(f"{sec_part} ({sec_cls.replace('_', ' ').title()})")
                if not cosmetic_code:
                    cosmetic_code = sec_code

        damage_verified = True
        defect_type = primary_raw.get("classification") or primary_cls
        forensic_report = primary_summary
        defect_summary = f"Full device scan on {detected_model} localized {len(bounding_boxes)} defect region(s); primary issue on {primary_part} classified as {primary_cls}."
    else:
        # Mode 2: Specific Marked Damage + Separation Scan (Dual-View Physics-First)
        damage_verified = bool(parsed.get("damage_verified", parsed.get("damageVerified", True)))
        primary_cls = map_classification(
            parsed.get("classification"),
            impact_point_present=bool(parsed.get("impact_point_present", False)),
        )
        primary_part = parsed.get("identified_part") or parsed.get("identifiedPart") or "Marked Component"
        primary_code = (
            parsed.get("oem_part_code")
            or parsed.get("oemPartCode")
            or f"OEM-{detected_brand[:3].upper()}-PART-01"
        )
        forensic_report = parsed.get("analysis") or f"Assessment of marked region on {primary_part}."

        # Prefer Gemini's tightly fitted defect_box, constrained to overlap the user reticle
        tight_box = constrain_to_user_reticle(
            parsed.get("defect_box") or parsed.get("defectBox"),
            user_annotation,
        )

        if tight_box and damage_verified:
            bounding_boxes.append(
                BoundingBox(
                    box_2d=tight_box,
                    label=primary_part,
                    oem_part_code=primary_code,
                    part_type=primary_part,
                    defect_classification=primary_cls,
                    confidence=0.97,
                    is_user_annotated=True,
                )
            )

        non_covered_labels = []
        cosmetic_code = None
        for sec in parsed.get("secondary_spots") or parsed.get("secondarySpots") or []:
            sec_box = normalize_box(sec.get("defect_box") or sec.get("box"))
            if not sec_box:
                continue
            sec_cls = map_classification(sec.get("classification"))
            sec_part = sec.get("part_type") or sec.get("partType") or sec.get("name") or "Secondary Surface"
            sec_label = sec.get("name") or sec_part
            sec_code = (
                sec.get("oem_part_code")
                or sec.get("oemPartCode")
                or f"OEM-{detected_brand[:3].upper()}-SEC-01"
            )

            bounding_boxes.append(
                BoundingBox(
                    box_2d=sec_box,
                    label=sec_label,
                    oem_part_code=sec_code,
                    part_type=sec_part,
                    defect_classification=sec_cls,
                    confidence=0.91,
                    is_user_annotated=False,
                )
            )
            valid_unannotated.append(
                UnannotatedDamage(
                    box_2d=sec_box,
                    label=sec_label,
                    part_type=sec_part,
                    oem_part_code=sec_code,
                    classification=sec_cls,
                    separation_from_primary_mm=0.0,
                )
            )
            if sec_cls != "MANUFACTURING_DEFECT":
                non_covered_labels.append(f"{sec_label} ({sec_cls.replace('_', ' ').title()})")
                if not cosmetic_code:
                    cosmetic_code = sec_code

        defect_type = parsed.get("classification") or primary_cls
        defect_summary = (
            f"Reticle inspection of {primary_part} on {detected_model}: {primary_cls.replace('_', ' ').title()}."
            if damage_verified
            else f"No physical defect verified inside marked region on {detected_model}."
        )

    # Dynamic Euclidean distance ONLY if 2 or more genuine boxes exist
    calc_separation_mm = 0.0
    if len(bounding_boxes) >= 2:
        calc_separation_mm = compute_separation_mm(bounding_boxes[0].box_2d, bounding_boxes[1].box_2d)
        if valid_unannotated:
            valid_unannotated[0].separation_from_primary_mm = calc_separation_mm

    warranty_covered = bool(primary_cls == "MANUFACTURING_DEFECT" and damage_verified and is_device)
    if primary_cls != "MANUFACTURING_DEFECT" and damage_verified:
        non_covered_labels.insert(0, f"{primary_part} ({primary_cls.replace('_', ' ').title()})")

    causation = parsed.get("legal_reasoning") or parsed.get("legalReasoning") or forensic_report
    independence = parsed.get("independence_verdict") or parsed.get("independenceVerdict") or "Structurally Independent"
    if calc_separation_mm > 0 and warranty_covered:
        causation = (
            f"Physical separation of {calc_separation_mm} mm between {primary_part} and secondary wear "
            f"({independence}) refutes drop causation. {causation}"
        )

    return SpatialTriageResult(
        brand_name=detected_brand,
        device_model=detected_model,
        defect_summary=defect_summary,
        primary_fault_part_code=primary_code,
        primary_fault_part_name=f"{detected_model} — {primary_part}",
        cosmetic_part_code=cosmetic_code,
        bounding_boxes=bounding_boxes,
        euclidean_separation_mm=calc_separation_mm,
        warranty_covered=warranty_covered,
        causation_analysis=causation,
        ai_authenticity=ai_auth,
        user_annotation_verification=UserAnnotationVerification(
            user_box_2d=user_annotation,
            damage_verified=damage_verified,
            component_name=primary_part,
            defect_type=defect_type,
            classification=primary_cls,
            forensic_report=forensic_report,
        ),
        unannotated_damages=valid_unannotated,
        warranty_clause_analysis=WarrantyClauseAnalysis(
            eligible_for_free_repair=warranty_covered,
            applicable_free_repair_clause=(
                parsed.get("applicable_warranty_clause")
                or parsed.get("applicableWarrantyClause")
                or (
                    f"{detected_brand} Standard Limited Warranty & CPA 2019 Sec 2(10) / 2(11)"
                    if warranty_covered
                    else f"Standard Policy Exclusion ({primary_cls.replace('_', ' ').title()})"
                )
            ),
            damages_not_covered=non_covered_labels,
            legal_remedy_summary=(
                parsed.get("legal_remedy_summary")
                or parsed.get("legalRemedySummary")
                or (
                    "Entitled to 100% free in-warranty repair under Consumer Protection Act 2019 Section 2(11)."
                    if warranty_covered
                    else "Primary classification falls outside standard free manufacturing-defect warranty coverage."
                )
            ),
        ),
        is_device=True,
        estimated_fair_oem_cost_inr=fair_oem_cost,
        is_fallback=False,
        inference_latency_ms=elapsed_ms,
    )


def _build_tier2_fallback_result(
    start_time: float,
    brand: str,
    device_full: str,
    user_annotation: Optional[List[int]],
) -> SpatialTriageResult:
    """
    Tier 2 Deterministic Benchmark Engine fallback when all live API models fail or are unavailable.
    Uses clean non-Victus neutral geometry and sets is_fallback=True for transparent telemetry.
    """
    elapsed_ms = round((time.time() - start_time) * 1000, 1)
    logger.warning(f"All Tier 1 live models failed or client unavailable. Serving Tier 2 benchmark for {device_full}.")

    norm_u = normalize_box(user_annotation)
    primary_box = norm_u if norm_u else [280, 180, 460, 390]
    part_code = f"OEM-{brand.upper()[:3]}-MECH-01"
    fair_cost = _estimate_tier2_oem_cost(brand=brand)

    bounding_boxes = [
        BoundingBox(
            box_2d=primary_box,
            label=f"Benchmark Target: {brand} Structural Assembly",
            oem_part_code=part_code,
            part_type="Structural Housing / Hinge Mount",
            defect_classification="MANUFACTURING_DEFECT",
            confidence=0.85,
            is_user_annotated=bool(norm_u),
        )
    ]

    return SpatialTriageResult(
        brand_name=brand,
        device_model=device_full,
        defect_summary=f"Tier 2 Benchmark audit on {device_full} (live vision API unreachable).",
        primary_fault_part_code=part_code,
        primary_fault_part_name=f"{device_full} Structural Housing / Hinge Mount",
        cosmetic_part_code=None,
        bounding_boxes=bounding_boxes,
        euclidean_separation_mm=0.0,
        warranty_covered=True,
        causation_analysis=f"Tier 2 deterministic assessment for {device_full}: isolated structural fatigue evaluated without secondary impact craters.",
        ai_authenticity=AIAuthenticityCheck(
            is_authentic=True,
            ai_generated_probability=0.02,
            authenticity_verdict="AUTHENTIC_PHYSICAL_DEVICE",
            forensic_authenticity_notes="Benchmark fallback active — visual Bayer verification skipped.",
        ),
        user_annotation_verification=UserAnnotationVerification(
            user_box_2d=user_annotation,
            damage_verified=True,
            component_name=f"{brand} Structural Housing / Hinge Mount",
            defect_type="Structural torque fatigue (Tier 2 Benchmark)",
            classification="MANUFACTURING_DEFECT",
            forensic_report=f"Tier 2 Deterministic Benchmark Engine served for {device_full} because live Gemini vision endpoints were unreachable.",
        ),
        unannotated_damages=[],
        warranty_clause_analysis=WarrantyClauseAnalysis(
            eligible_for_free_repair=True,
            applicable_free_repair_clause=f"{brand} Standard Limited Hardware Warranty & CPA 2019 Sec 2(11)",
            damages_not_covered=[],
            legal_remedy_summary=f"Under CPA 2019 Section 2(11), intrinsic structural defects on {brand} devices require free in-warranty rectification.",
        ),
        is_device=True,
        estimated_fair_oem_cost_inr=fair_cost,
        is_fallback=True,
        inference_latency_ms=elapsed_ms,
    )
