from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class BoundingBox(BaseModel):
    """
    Normalized 2D Bounding Box on a 0-1000 scale.
    Box coordinates: [ymin, xmin, ymax, xmax]
    """
    box_2d: List[int] = Field(
        ...,
        description="Coordinates [ymin, xmin, ymax, xmax] scaled 0 to 1000",
        min_length=4,
        max_length=4
    )
    label: str = Field(..., description="Descriptive label of the detected region")
    oem_part_code: Optional[str] = Field(None, description="HP / OEM part number if applicable")
    part_type: str = Field(..., description="E.g., 'B-cover bezel', 'C-cover palmrest', 'Display Hinge'")
    defect_classification: Literal["MANUFACTURING_DEFECT", "COSMETIC_WEAR", "IMPACT_DAMAGE", "NORMAL_WEAR"]
    confidence: float = Field(..., ge=0.0, le=1.0)


class SpatialTriageResult(BaseModel):
    """
    Step 1: Spatial Defect Triage Output.
    Grounds physical failure to manufacturing stress vs isolated cosmetic surface blemishes.
    """
    device_model: str = Field(..., example="HP Victus 15-fa1310tx")
    defect_summary: str = Field(..., description="Summary of physical failure triage")
    primary_fault_part_code: str = Field(..., description="OEM Part code responsible for structural defect (e.g., N13327-001)")
    primary_fault_part_name: str = Field(..., description="OEM Part description (e.g., B-cover LCD bezel)")
    cosmetic_part_code: Optional[str] = Field(None, description="OEM Part code for non-structural cosmetic wear (e.g., N13299-001)")
    bounding_boxes: List[BoundingBox] = Field(default_factory=list)
    euclidean_separation_mm: float = Field(
        ...,
        description="Physical Euclidean distance in mm between cosmetic surface marks and structural hinge failure. Separation >140mm disproves user impact causation.",
        ge=0.0
    )
    warranty_covered: bool = Field(
        ...,
        description="True if physical defect stems from factory hinge torque flaw rather than customer drop"
    )
    causation_analysis: str = Field(..., description="Physical engineering justification proving non-impact manufacturing failure")


class PriceGougingAudit(BaseModel):
    
    pass

class LegalRagResponse(BaseModel):
    query: str = Field(..., description="ইউজার রিকোয়েস্ট টেক্সট")
    retrieved_documents: List[str] = Field(..., description="Vertex AI Search থেকে পাওয়া ডকুমেন্টের টেক্সট তালিকা")
    """
    Step 2: Price-Gouging Rule Engine Output.
    Deterministically audits walk-in service center quotation against genuine OEM bill of materials.
    """
    walk_in_quote_inr: float = Field(..., description="Quote demanded by unauthorized/authorized service center (e.g., 20000.0)")
    fair_oem_cost_inr: float = Field(..., description="Fair factory OEM spare part price + standard labor (e.g., 2500.0)")
    price_gouging_multiplier: float = Field(..., description="Deterministic ratio: walk_in_quote_inr / fair_oem_cost_inr (e.g., 8.0)")
    excess_unjustified_inr: float = Field(..., description="Overcharge amount (walk_in_quote_inr - fair_oem_cost_inr)")
    gouging_severity: Literal["EXTREME_GOUGING", "SIGNIFICANT_GOUGING", "MODERATE_MARKUP", "FAIR_PRICING"]
    is_gouging_detected: bool = Field(True, description="True if multiplier >= 1.5x")
    statutory_violation: str = Field("Consumer Protection Act 2019, Section 2(47) - Unfair Trade Practice")


class LegalNoticePackage(BaseModel):
    """
    Step 3: Grounded Legal Drafter & Critic Critic Output.
    Notices drafted in English, Hindi, and Bengali under Consumer Protection Act 2019.
    """
    crm_job_sheet_demand_48h: str = Field(..., description="Formal 48-Hour ultimatum to service center CRM desk")
    notice_english: str = Field(..., description="e-Jagriti Section 35 / CPA 2019 Section 2(11) formal pre-litigation notice in English")
    notice_hindi: str = Field(..., description="e-Jagriti Section 35 pre-litigation legal notice in Hindi (हिंदी)")
    notice_bengali: str = Field(..., description="e-Jagriti Section 35 pre-litigation legal notice in Bengali (বাংলা)")
    statutory_citations: List[str] = Field(
        default_factory=lambda: [
            "Consumer Protection Act 2019, Section 2(11) [Deficiency in Service]",
            "Consumer Protection Act 2019, Section 2(47) [Unfair Trade Practice]",
            "Consumer Protection Act 2019, Section 35 [District Commission e-Jagriti Complaint]",
            "Consumer Protection (E-Commerce) Rules 2020, Rule 5"
        ]
    )
    gemma3_judge_verified: bool = Field(True, description="Adversarial Gemma 3 Judge verification confirming 0% hallucinated statutes")
    critic_verification_notes: str = Field(..., description="Gemma 3 Critic verification confirmation log")


class StateLoopItem(BaseModel):
    state: str
    status: Literal["COMPLETED", "ACTIVE", "PENDING"]
    timestamp: str
    description: str


class ClaimAnalysisResponse(BaseModel):
    """
    Unified Endpoint Response: POST /api/analyze-claim
    Full production claim payload including spatial triage, pricing audit, legal notices, and 6-state loop.
    """
    claim_id: str = Field(..., example="NYAY-2026-HP-001")
    case_number: str = Field(..., example="CASE-HP-VICTUS-15FA-001")
    created_at: str
    current_state: Literal[
        "DEFECT_DETECTED",
        "EVIDENCE_LOCKED",
        "QUOTE_AUDITED",
        "DEMAND_ISSUED",
        "WAITING_FOR_MANUFACTURER",
        "ESCALATED_E_JAGRITI"
    ] = "WAITING_FOR_MANUFACTURER"
    sla_timer_hours_remaining: float = Field(48.0, description="48-hour SLA countdown timer for OEM reply")
    device_image_sha256: str = Field(..., description="Cryptographic SHA-256 frame hash of uploaded device image")
    invoice_sha256: Optional[str] = Field(None, description="Cryptographic SHA-256 hash of invoice if provided")
    triage: SpatialTriageResult
    pricing: PriceGougingAudit
    legal_package: LegalNoticePackage
    state_loop: List[StateLoopItem]
    fernet_encrypted_telemetry: str = Field(..., description="Fernet AES-128-CBC + HMAC encrypted audit payload for regulatory logging")
