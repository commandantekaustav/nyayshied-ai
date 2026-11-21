export interface BoundingBox {
  box_2d: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
  label: string;
  oem_part_code?: string;
  part_type: string;
  defect_classification: 'MANUFACTURING_DEFECT' | 'COSMETIC_WEAR' | 'IMPACT_DAMAGE' | 'NORMAL_WEAR';
  confidence: number;
  is_user_annotated?: boolean;
}

export interface AIAuthenticityCheck {
  is_authentic: boolean;
  ai_generated_probability: number;
  authenticity_verdict: 'AUTHENTIC_PHYSICAL_DEVICE' | 'SUSPECTED_AI_SYNTHETIC';
  forensic_authenticity_notes: string;
}

export interface UserAnnotationVerification {
  user_box_2d?: [number, number, number, number] | null;
  damage_verified: boolean;
  component_name: string;
  defect_type: string;
  classification: 'MANUFACTURING_DEFECT' | 'COSMETIC_WEAR' | 'IMPACT_DAMAGE' | 'NORMAL_WEAR';
  forensic_report: string;
}

export interface UnannotatedDamage {
  box_2d: [number, number, number, number];
  label: string;
  part_type?: string;
  oem_part_code?: string;
  classification: 'COSMETIC_WEAR' | 'MANUFACTURING_DEFECT' | 'IMPACT_DAMAGE' | 'NORMAL_WEAR';
  separation_from_primary_mm: number;
}

export interface WarrantyClauseAnalysis {
  eligible_for_free_repair: boolean;
  applicable_free_repair_clause: string;
  damages_not_covered: string[];
  legal_remedy_summary: string;
}

export interface SpatialTriageResult {
  brand_name?: string;
  device_model: string;
  defect_summary: string;
  primary_fault_part_code: string;
  primary_fault_part_name: string;
  cosmetic_part_code?: string;
  bounding_boxes: BoundingBox[];
  euclidean_separation_mm: number;
  warranty_covered: boolean;
  causation_analysis: string;
  ai_authenticity?: AIAuthenticityCheck;
  user_annotation_verification?: UserAnnotationVerification | null;
  unannotated_damages?: UnannotatedDamage[];
  warranty_clause_analysis?: WarrantyClauseAnalysis | null;
  is_device?: boolean;
  estimated_fair_oem_cost_inr?: number;
  is_fallback?: boolean;
  inference_latency_ms?: number;
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

export interface AuditLogEntry {
  timestamp: string;
  action: string;
  latency_ms: number;
  model_used: string;
  details: string;
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
  audit_logs?: AuditLogEntry[];
}

export type ActiveScreen = 1 | 2 | 3 | 4;
export type LanguageTab = 'en' | 'hi' | 'bn';
