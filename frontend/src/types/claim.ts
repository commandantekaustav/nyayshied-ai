export interface BoundingBox {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  label: string;
  oem_part_code?: string;
  part_type: string;
  defect_classification: 'MANUFACTURING_DEFECT' | 'COSMETIC_WEAR' | 'IMPACT_DAMAGE' | 'NORMAL_WEAR';
  confidence: number;
}

export interface SpatialTriageResult {
  device_model: string;
  defect_summary: string;
  primary_fault_part_code: string;
  primary_fault_part_name: string;
  cosmetic_part_code?: string;
  bounding_boxes: BoundingBox[];
  euclidean_separation_mm: number;
  warranty_covered: boolean;
  causation_analysis: string;
}

export interface PriceGougingAudit {
  walk_in_quote_inr: number;
  fair_oem_cost_inr: number;
  price_gouging_multiplier: number;
  excess_unjustified_inr: number;
  gouging_severity: 'EXTREME_GOUGING' | 'SIGNIFICANT_GOUGING' | 'MODERATE_MARKUP' | 'FAIR_PRICING';
  is_gouging_detected: boolean;
  statutory_violation: string;
}

export interface LegalNoticePackage {
  crm_job_sheet_demand_48h: string;
  notice_english: string;
  notice_hindi: string;
  notice_bengali: string;
  statutory_citations: string[];
  gemma3_judge_verified: boolean;
  critic_verification_notes: string;
}

export interface StateLoopItem {
  state: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING';
  timestamp: string;
  description: string;
}

export interface ClaimAnalysisResponse {
  claim_id: string;
  case_number: string;
  created_at: string;
  current_state: 'DEFECT_DETECTED' | 'EVIDENCE_LOCKED' | 'QUOTE_AUDITED' | 'DEMAND_ISSUED' | 'WAITING_FOR_MANUFACTURER' | 'ESCALATED_E_JAGRITI';
  sla_timer_hours_remaining: number;
  device_image_sha256: string;
  invoice_sha256?: string;
  triage: SpatialTriageResult;
  pricing: PriceGougingAudit;
  legal_package: LegalNoticePackage;
  state_loop: StateLoopItem[];
  fernet_encrypted_telemetry: string;
}

export type ActiveScreen = 1 | 2 | 3 | 4;
export type LanguageTab = 'en' | 'hi' | 'bn';
