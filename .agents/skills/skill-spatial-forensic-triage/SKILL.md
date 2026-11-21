---
name: skill-spatial-forensic-triage
description: |
  Codifies the production multimodal spatial detection and forensic hardware triage architecture for NyayShield AI: Vertex AI (`vertexai=True`) initialization with `gemini-3.8-flash` (`gemini-3.8-flash` -> `gemini-3.5-flash` -> `gemini-3.5-flash-lite`), single-call dual-image inference (EXIF-corrected full red-mark overview + 20%-padded native-resolution macro crop), normalized `[ymin, xmin, ymax, xmax]` (0-1000) coordinate contract, and Physics-First Pydantic `response_schema` field ordering at `temperature=0.1`.
---

# Spatial Forensic Triage & Dual-Image Multimodal Architecture

## Overview
This skill defines the authoritative computer vision and forensic inference contract for **NyayShield AI**. It guarantees high-precision defect localization and mechanical causation triage (`MANUFACTURING_DEFECT` vs. `IMPACT_DAMAGE` vs. `COSMETIC_WEAR`) without phantom bounding boxes, coordinate drift, or premature classification bias.

---

## 1. Vertex AI Client Initialization & Model Contract

1. **Primary Enterprise Path (`USE_VERTEXAI=true`)**:
   - Authenticate via the unified `google-genai` SDK targeting Google Cloud Vertex AI:
   ```python
   from google import genai
   from google.genai import types

   client = genai.Client(
       vertexai=True,
       project=settings.GCP_PROJECT_ID,
       location=settings.GCP_LOCATION,  # e.g., "us-central1" or "asia-south1"
       http_options=types.HttpOptions(timeout=35000),
   )
   ```
   - Optional local fallback: When `USE_VERTEXAI=false`, initialize `genai.Client(api_key=settings.GEMINI_API_KEY, http_options=types.HttpOptions(timeout=35000))`.
2. **Model & Generation Configuration**:
   - **Primary Model ID**: `gemini-3.8-flash` (cascade: `gemini-3.8-flash` → `gemini-3.5-flash` → `gemini-3.5-flash-lite`)
   - **Temperature**: `0.1` (deterministic physical analysis with controlled token diversity for JSON schema adherence)
   - **Response Format**: `response_mime_type="application/json"` with strict Pydantic `response_schema` enforcement.

---

## 2. Single-Call Dual-Image Payload (EXIF + Red-Mark Overview + 20% Macro Crop)

Always normalize sensor orientation before any coordinate calculation or cropping:

```python
from PIL import Image, ImageDraw, ImageOps

# 1. Strip EXIF rotation drift before pixel indexing
native_img = ImageOps.exif_transpose(Image.open(io.BytesIO(raw_bytes))).convert("RGB")
nat_w, nat_h = native_img.size
```

When a user marks a target region `[ymin, xmin, ymax, xmax]` (0–1000 scale), construct **two complementary views** and pass both in a **single multimodal `generate_content` call** (zero extra round-trip latency):

1. **Image 1 — Global Context Overview (EXIF-Corrected, Max 1600px, Red-Mark Flattened)**:
   - Resize a copy of `native_img` preserving aspect ratio (`max(w, h) <= 1600`).
   - Draw the user's reticle directly onto the overview copy in high-contrast `#EF4444` (`width=6`) so the vision model sees the defect's exact macro location relative to the chassis, hinges, vents, and bezels.
2. **Image 2 — 20%-Padded Native-Resolution Macro Crop (Unmarked)**:
   - Crop directly from the **unmarked, full-resolution `native_img`** around `[ymin, xmin, ymax, xmax]` expanded by **20% directional padding** on each axis, clamped to `[0, nat_w]` and `[0, nat_h]`:
   ```python
   y1 = int((ymin / 1000.0) * nat_h)
   x1 = int((xmin / 1000.0) * nat_w)
   y2 = int((ymax / 1000.0) * nat_h)
   x2 = int((xmax / 1000.0) * nat_w)

   pad_y = int((y2 - y1) * 0.20)
   pad_x = int((x2 - x1) * 0.20)

   macro_crop = native_img.crop((
       max(0, x1 - pad_x),
       max(0, y1 - pad_y),
       min(nat_w, x2 + pad_x),
       min(nat_h, y2 + pad_y),
   ))
   ```
   - Preserves fine-grain fracture physics (plastic boss shear lines, stress whitening, radial impact spallation, and paint/anodized surface integrity) without red-line occlusion.

---

## 3. Normalized `[ymin, xmin, ymax, xmax]` Coordinate Contract (0–1000 Scale)

1. **Strict Axis Ordering**:
   - Every bounding box across backend Pydantic models, prompts, and frontend canvases MUST follow `[ymin, xmin, ymax, xmax]` normalized to integers in `[0, 1000]`.
   - Never mix `[x, y, w, h]` into model payloads or API responses.
2. **Aspect-Ratio-Safe Frontend Rendering**:
   - Wrap the `<img>` and reticle overlay inside a shrink-wrapped `relative inline-block` container so pointer coordinates map 1:1 to `naturalWidth` / `naturalHeight` with zero `object-contain` pillarbox or letterbox drift.
   - Render output bounding boxes on `<canvas>` sized to the image's natural aspect ratio.

---

## 4. Physics-First Pydantic `response_schema` Ordering

LLMs commit prematurely when asked to emit a verdict label before inspecting physical evidence. The `response_schema` MUST place raw visual and mechanical observations **before** `classification`:

```python
from typing import List, Literal, Optional
from pydantic import BaseModel, Field

class PhysicsFirstDefectReport(BaseModel):
    # Stage 1: Device & Component Identity
    is_device: bool = Field(..., description="False if photo does not depict a consumer electronic device")
    brand_name: str = Field(..., description="Visually verified OEM brand (e.g., HP, Dell, Lenovo, Apple)")
    device_model: str = Field(..., description="Visually verified sub-family (e.g., HP Pavilion 15, Dell Inspiron)")
    component_name: str = Field(..., description="Specific hardware assembly showing the defect")
    oem_part_code: Optional[str] = Field(None, description="Known OEM spare part number if identifiable")

    # Stage 2: Raw Physical Evidence (Evaluated BEFORE Classification)
    material_and_surface_observations: str = Field(
        ..., description="Macro observations: polycarbonate vs aluminum, stress whitening, anodized finish, abrasion"
    )
    external_impact_dent_or_crush_present: bool = Field(
        ..., description="True ONLY if radial spider-cracks, crushed corners, or blunt-force indentation are visible"
    )
    failure_mechanics_analysis: str = Field(
        ..., description="Mechanical causation: internal hinge torque fatigue/boss shear vs external drop trauma"
    )

    # Stage 3: Final Verdict & Tight Coordinates (Evaluated LAST)
    classification: Literal["MANUFACTURING_DEFECT", "IMPACT_DAMAGE", "COSMETIC_WEAR"]
    defect_box_2d: List[int] = Field(..., description="Tight [ymin, xmin, ymax, xmax] box on 0-1000 scale")
    unannotated_secondary_boxes: List[List[int]] = Field(
        default_factory=list,
        description="Empty list [] if no genuine secondary defect exists on the physical device"
    )
```

---

## 5. Verification Checklist

- [ ] `genai.Client` initializes with `vertexai=True` when `USE_VERTEXAI=true` and uses the active `gemini-3.8-flash` cascade.
- [ ] EXIF transposition runs before coordinate math and macro cropping.
- [ ] Both the red-marked overview and the 20%-padded unmarked macro crop are passed in a single multimodal call.
- [ ] All bounding boxes adhere strictly to `[ymin, xmin, ymax, xmax]` in `0..1000`.
- [ ] Physical observation fields precede `classification` in the Pydantic schema at `temperature=0.1`.
