# NyayShield AI — REST API Reference & Data Contracts
**Google Startup Buildathon India 2026**
*Last Synchronized: 2026-11-20 21:56:33 UTC*

---

## 1. System Endpoints Overview

| Method | Path | Summary | Tags |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Root service heartbeat, enabled features, and active models | System |
| `GET` | `/api/health` | Service health status, Fernet encryption status, timestamp | System |
| `GET` | `/api/audit-logs` | Real-time timestamped latency and change audit log stream | Telemetry & Auditing |
| `GET` | `/api/metrics` | Raw JSONL telemetry stream for evaluation & benchmarking | Telemetry & Auditing |
| `GET` | `/api/golden-case` | Instant deterministic Golden Case #001 test payload | Test & Verification |
| `POST` | `/api/analyze-claim` | Unified multimodal spatial triage, price gouging & statutory notice pipeline | Core Analysis Engine |

---

## 2. Core Endpoint Specifications

### `POST /api/analyze-claim`
Unified multi-part form endpoint executing the complete 6-stage warranty dispute workflow.

#### Request Headers
- `Content-Type`: `multipart/form-data`

#### Form Parameters
| Parameter | Type | Required | Default | Description |
| :--- | :--- | :--- | :--- | :--- |
| `device_image` | File | **Yes** | — | High-resolution image of the damaged chassis, hinge, or screen |
| `invoice_file` | File | No | `null` | Optional service center walk-in quotation slip or invoice |
| `walk_in_quote_inr` | Float | No | `20000.0` | Repair quote demanded by the service center in INR |
| `brand_name` | String | No | `"HP"` | Manufacturer brand (HP, Dell, Lenovo, Apple, Asus) |
| `model_name` | String | No | `null` | Specific hardware model number (e.g. `Victus 15-fa1310tx`) |
| `purchase_date` | String | No | `null` | Purchase date formatted as `YYYY-MM-DD` |
| `purchase_type` | String | No | `"Standard 1-Yr"`| Purchase channel or EMI / Credit Card extended protection |
| `user_description`| String | No | `null` | User description of defect symptoms |
| `user_annotation` | String | No | `null` | JSON string of user drawn bounding box `[ymin, xmin, ymax, xmax]` |
| `use_golden_case` | Bool | No | `false` | Fast-path flag for deterministic Golden Case #001 demonstration |

#### Response Schema: `ClaimAnalysisResponse` (200 OK)
```json
{
  "claim_id": "NYAY-20261121-8F3E21",
  "case_number": "CASE-HP-8F3E",
  "created_at": "2026-11-21T03:20:00Z",
  "current_state": "WAITING_FOR_MANUFACTURER",
  "sla_timer_hours_remaining": 48.0,
  "device_image_sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "invoice_sha256": "4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a",
  "triage": {
    "brand_name": "HP",
    "device_model": "HP Victus 15-fa1310tx",
    "defect_summary": "Display bezel separation and structural hinge bracket detachment.",
    "primary_fault_part_code": "M31012-001",
    "primary_fault_part_name": "Display Bezel & Hinge Bracket Assembly",
    "cosmetic_part_code": "M31014-001",
    "bounding_boxes": [
      {
        "box_2d": [380, 240, 560, 480],
        "label": "Separated display bezel snap-fit clip",
        "oem_part_code": "M31012-001",
        "part_type": "B-cover bezel",
        "defect_classification": "MANUFACTURING_DEFECT",
        "confidence": 0.98,
        "is_user_annotated": true
      }
    ],
    "euclidean_separation_mm": 142.5,
    "warranty_covered": true,
    "causation_analysis": "Torque friction overload during standard lid traversal. Zero impact marks.",
    "ai_authenticity": {
      "is_authentic": true,
      "ai_generated_probability": 0.02,
      "authenticity_verdict": "AUTHENTIC_PHYSICAL_DEVICE",
      "forensic_authenticity_notes": "Optical Bayer matrix noise and realistic edge gradients confirmed."
    },
    "user_annotation_verification": {
      "user_box_2d": [380, 240, 560, 480],
      "damage_verified": true,
      "component_name": "Right Display Hinge & Bezel Clip Assembly",
      "defect_type": "Tensile torque fracture and snap-fit bezel clip disengagement",
      "classification": "MANUFACTURING_DEFECT",
      "forensic_report": "User highlighted region demonstrates internal fastener failure."
    },
    "unannotated_damages": [],
    "warranty_clause_analysis": {
      "eligible_for_free_repair": true,
      "applicable_free_repair_clause": "Standard Limited Warranty Section 3.1 (Material & Workmanship Defect)",
      "damages_not_covered": ["Surface paint scuffs outside display assembly"],
      "legal_remedy_summary": "Mandatory replacement under Consumer Protection Act 2019 Section 2(11)"
    },
    "inference_latency_ms": 2840.0
  },
  "pricing": {
    "walk_in_quote_inr": 20000.0,
    "fair_oem_cost_inr": 2500.0,
    "price_gouging_multiplier": 8.0,
    "excess_unjustified_inr": 17500.0,
    "gouging_severity": "EXTREME_GOUGING",
    "is_gouging_detected": true,
    "statutory_violation": "Consumer Protection Act 2019, Section 2(47) - Unfair Trade Practice"
  },
  "legal_package": {
    "crm_job_sheet_demand_48h": "FORMAL STATUTORY NOTICE OF DEFICIENCY IN SERVICE...",
    "notice_english": "BEFORE THE DISTRICT CONSUMER DISPUTES REDRESSAL COMMISSION...",
    "notice_hindi": "उपभोक्ता संरक्षण अधिनियम 2019 की धारा 35 के अंतर्गत परिवाद...",
    "notice_bengali": "ক্রেতা সুরক্ষা আইন ২০১৯-এর ধারা ৩৫ মোতাবেক অভিযোগ...",
    "statutory_citations": [
      "Consumer Protection Act 2019, Section 2(11) [Deficiency in Service]",
      "Consumer Protection Act 2019, Section 2(47) [Unfair Trade Practice]",
      "Consumer Protection Act 2019, Section 35 [District Commission Complaint]"
    ],
    "gemma3_judge_verified": true,
    "critic_verification_notes": "All statutory provisions verified against legal database."
  },
  "state_loop": [
    {
      "state": "DEFECT_DETECTED",
      "status": "COMPLETED",
      "timestamp": "2026-11-21T03:20:00Z",
      "description": "Manufacturing flaw detected and localized."
    }
  ],
  "fernet_encrypted_telemetry": "gAAAAABnh1...",
  "audit_logs": []
}
```

---

## 3. Telemetry & Log Streaming API

### `GET /api/audit-logs`
Returns real-time timestamped audit logs recording:
- Pipeline execution latencies
- AI Model invocations (Gemini 2.5 Flash, Gemma 3)
- Reticle coordinate parsing metrics
- Failsafe activations

### `GET /api/metrics`
Streams raw line-delimited JSON metrics (`metrics.jsonl`) for longitudinal performance analysis and latency benchmarking.
