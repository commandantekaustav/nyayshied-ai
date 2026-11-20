# NyayShield AI — Comprehensive System Documentation
**Google Startup Buildathon India 2026**
*Last Synchronized: 2026-11-20 21:56:33 UTC*

---

## 1. System Mission & Scope
**NyayShield AI** is an AI-powered legal and technical shield for consumer electronics. When consumers bring laptops or hardware with design defects (such as cracked hinges or detached display bezels) to authorized service centers, OEMs routinely reject warranty coverage by classifying internal mechanical stress as "Customer Induced Damage" (CID / ZEXW). The service centers then demand exorbitant repair fees (e.g. demanding Rs 20,000 for a Rs 2,500 clip assembly).

NyayShield AI automates the counter-forensic workflow:
1. Verifies physical hardware failure within an interactive user annotation reticle.
2. Scans for secondary cosmetic scratches to mathematically prove non-drop separation via Euclidean distance ($>140\text{ mm}$).
3. Detects AI synthetic images via optical Bayer noise analysis to protect insurers and enterprises.
4. Audits repair quotes to detect unlawful price gouging ($M \ge 2.0\times$) under Consumer Protection Act 2019 Section 2(47).
5. Auto-generates tri-lingual legal notices (English, Hindi, Bengali) with grounded statutory citations and multi-lingual voice narration.
6. Manages a 48-hour autonomous SLA state loop culminating in formal e-Jagriti Section 35 court complaints.

---

## 2. Product Capabilities & User Flows

```
[Screen 1: Defect Capture]
  ├── Image Upload (Drag-and-drop / Mobile Camera)
  ├── Interactive 2D Bounding Box Drawing Reticle
  ├── Brand, Model, Purchase Channel & Description Selectors
  └── Forensic Authenticity & Defect Triage Pipeline
       ↓
[Screen 2: Warranty & Price-Gouging Audit]
  ├── Service Center Quote vs OEM Baseline Comparison
  ├── Price-Gouging Multiplier Gauge (e.g. 8.0x Extreme Gouging)
  ├── Statutory Violation Identification (CPA Sec 2(47))
  └── Free Repair Warranty Clause Entitlement Card
       ↓
[Screen 3: Statutory Dispute Enforcement]
  ├── 48-Hour CRM Job Sheet Demand Letter
  ├── e-Jagriti Section 35 District Commission Formal Complaint
  ├── 1-Tap Tri-Lingual Language Toggle (English / Hindi / Bengali)
  ├── Native Web Speech API Voice Narration (en-IN / hi-IN / bn-IN)
  └── PDF & TXT Legal Package Export
```

---

## 3. Frontend Architecture

- **Mobile-First PWA Responsive Layout**: Optimized for mobile screens (`max-w-[430px]`) with seamless viewport scaling.
- **Judge Evaluation Drawer (`JudgeDrawer.tsx`)**: Desktop collapsible side-drawer featuring:
  - **Payload Tab**: Live JSON request/response inspector with 1-click clipboard export.
  - **SLA Loop Tab**: Real-time 6-state dispute lifecycle timeline.
  - **Audit Logs Tab**: Live latency, timestamp, and AI model telemetry stream.
  - **Rubric Tab**: Direct audit matrix against all 6 official Buildathon criteria (100% total).
  - **Architecture Tab**: Visual system models and component topology.
- **Issue Tracker Modal (`IssueTrackerModal.tsx`)**: Team collaboration dashboard tracking developer feedback, recurrence frequency, P0/P1 priorities, and subsystem mapping.
- **Interactive Reticle Canvas (`ReticleCanvas.tsx`)**: Touch and mouse supported normalized 2D coordinate selector `[ymin, xmin, ymax, xmax]` (0-1000 scale).

---

## 4. Backend & AI Architecture

- **FastAPI Engine (`backend/main.py`)**: Asynchronous REST gateway with non-blocking file streaming and error-resilient failsafe handlers.
- **Multimodal Spatial Vision Triage (`backend/services/triage.py`)**:
  - Leverages Google Gemini 2.5 Flash with structured system instructions.
  - Extracts normalized bounding boxes, part taxonomy codes, and defect classifications (`MANUFACTURING_DEFECT`, `COSMETIC_WEAR`, `IMPACT_DAMAGE`).
  - Computes spatial Euclidean separation between cosmetic wear and primary structural fractures.
- **Price-Gouging Engine (`backend/services/pricing.py`)**:
  - Compares quoted repair costs against OEM BOM replacement baselines.
  - Multiplier thresholds:
    - $M \ge 4.0\times$: `EXTREME_GOUGING`
    - $2.0\times \le M < 4.0\times$: `SIGNIFICANT_GOUGING`
    - $1.2\times \le M < 2.0\times$: `MODERATE_MARKUP`
    - $M < 1.2\times$: `FAIR_PRICING`
- **Legal Notice Generator (`backend/services/legal_drafter.py`)**:
  - Grounded drafting with Gemma 3 legal critic verification.
  - Enforces mandatory statutory citations: CPA 2019 Sec 2(11), Sec 2(47), Sec 35, and e-Commerce Rules 2020 Rule 5.
- **Cryptographic Vault (`backend/core/security.py`)**:
  - SHA-256 asset hashing for image and invoice files.
  - RegEx PII scrubbing (phone numbers, email addresses, postal codes).
  - Fernet symmetric encryption (AES-128-CBC + HMAC-SHA256) for claim telemetry.

---

## 5. Compliance & Statutory Mappings

| Statutory Provision | Full Legal Act Title | System Enforcement in NyayShield AI |
| :--- | :--- | :--- |
| **Section 2(11)** | Consumer Protection Act 2019 | Classifies warranty denial for intrinsic design defects as actionable Deficiency in Service. |
| **Section 2(47)** | Consumer Protection Act 2019 | Establishes part-level price-gouging ($M \ge 2.0\times$) as an Unfair Trade Practice. |
| **Section 35** | Consumer Protection Act 2019 | Standard format for direct digital filing before the District Consumer Disputes Redressal Commission (e-Jagriti / e-Daakhil). |
| **Rule 5** | CPA (E-Commerce) Rules 2020 | Mandates consumer grievance acknowledgment and 48-hour resolution timelines. |
