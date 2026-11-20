# NyayShield AI — System Architecture & Engineering Models
**Google Startup Buildathon India 2026**
*Last Synchronized: 2026-11-20 21:56:33 UTC*

---

## 1. Executive Summary & Engineering Feats

NyayShield AI is an autonomous consumer warranty defense engine designed to counter unfair trade practices and warranty rejections across consumer electronics. It combines multimodal spatial vision, real-time price gouging calculations, zero-knowledge cryptographic chain-of-custody, and grounded tri-lingual statutory complaint drafting.

### The 6 Core Engineering Feats:
1. **Multimodal Spatial Vision Defect Triage (Gemini 2.5 Flash)**: Normalized 2D bounding boxes `[ymin, xmin, ymax, xmax]` isolating manufacturing fractures from cosmetic marks with Euclidean distance proofs ($>140\text{ mm}$).
2. **Forensic Bayer Matrix Optical Noise Gate**: Protects manufacturers and insurers by detecting AI-generated synthetic damage imagery before processing.
3. **Deterministic Part-Level Price-Gouging Engine**: Automatically audits service center repair quotations against OEM catalog BOM baseline costs to compute statutory overcharge multipliers ($M \ge 2.0\times$) under CPA 2019 Section 2(47).
4. **Adversarial Grounded Legal Critic (Gemma 3)**: Validates statutory citations and generates binding legal notices in English, Hindi, and Bengali.
5. **Zero-Knowledge Cryptographic Evidence Lock**: Computes SHA-256 asset hashes and Fernet AES-128 PII encryption to maintain court-admissible chain-of-custody.
6. **Autonomous 6-State Dispute Resolution Loop**: Automated 48-hour SLA tracking transitioning from manufacturer CRM demand to e-Jagriti Section 35 judicial escalation.

---

## 2. High-Level C4 Context Model

```mermaid
flowchart TD
    subgraph Users ["Actors & Stakeholders"]
        Consumer["Aggrieved Consumer / B2C User"]
        B2BClaims["OEM Service Center / Enterprise Claims Team"]
        Judge["Buildathon Hackathon Judge"]
    end

    subgraph NyayShieldPlatform ["NyayShield AI Platform (Edge + Cloud)"]
        PWA["Mobile-First PWA (React + Vite + Tailwind)"]
        APIGateway["FastAPI Gateway (Port 8000 / Cloudflare Tunnel)"]
        VisionEngine["Multimodal Defect Triage Engine (Gemini 2.5 Flash)"]
        PricingEngine["Deterministic Price-Gouging Rule Engine"]
        LegalCritic["Grounded Statutory Drafter & Critic (Gemma 3)"]
        CryptoLayer["Fernet AES-128 & SHA-256 Cryptographic Vault"]
    end

    subgraph ExternalSystems ["External & Judicial Integrations"]
        VertexAI["Google Vertex AI / Gemini API"]
        OEMPortal["OEM CRM Customer Care API"]
        eJagriti["National Consumer Commission (e-Jagriti / e-Daakhil)"]
    end

    Consumer -->|"Uploads device image & draws reticle"| PWA
    B2BClaims -->|"Inspects verified damage & pricing audit"| APIGateway
    Judge -->|"Inspects live telemetry & 6-pillar rubrics"| PWA

    PWA -->|"REST / multipart upload"| APIGateway
    APIGateway -->|"Spatial prompt & image bytes"| VisionEngine
    VisionEngine -->|"Google GenAI API"| VertexAI
    APIGateway -->|"BOM catalog comparison"| PricingEngine
    APIGateway -->|"Statutory grounding"| LegalCritic
    LegalCritic -->|"Google GenAI API"| VertexAI
    APIGateway -->|"Evidence lock"| CryptoLayer

    APIGateway -.->|"Dispatches 48h demand notice"| OEMPortal
    APIGateway -.->|"Escalates Section 35 complaint"| eJagriti
```

---

## 3. End-to-End Multimodal Analysis Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor User as Consumer
    participant UI as Mobile PWA (React)
    participant API as FastAPI Gateway
    participant AI as Gemini 2.5 Flash (Vision)
    participant Rule as Price Gouging Engine
    participant Critic as Gemma 3 Legal Critic
    participant Vault as Crypto Vault (AES-128 / SHA-256)

    User->>UI: Selects device photo & draws defect reticle
    UI->>UI: Normalizes coordinates to [ymin, xmin, ymax, xmax] (0-1000)
    UI->>API: POST /api/analyze-claim (Image + Reticle + Quote INR)
    
    activate API
    API->>Vault: Compute SHA-256 image frame hash
    Vault-->>API: Device Image Hash (court-admissible)
    
    API->>AI: Multimodal Spatial Triage Request (Image + Reticle + Prompt)
    activate AI
    AI-->>API: SpatialTriageResult (BBox, Defect Type, Authenticity, Euclidean dist)
    deactivate AI

    API->>Rule: Audit walk-in quote vs OEM BOM part baseline (Rs 2,500)
    activate Rule
    Rule-->>API: PriceGougingAudit (Multiplier: 8.0x, EXTREME_GOUGING, CPA Sec 2(47))
    deactivate Rule

    API->>Critic: Draft 48h CRM Demand + e-Jagriti Sec 35 (EN/HI/BN)
    activate Critic
    Critic-->>API: Grounded Legal Notice Package + Verification Notes
    deactivate Critic

    API->>Vault: Encrypt PII & Telemetry via Fernet AES-128
    Vault-->>API: Encrypted Telemetry String
    
    API-->>UI: 200 OK (ClaimAnalysisResponse)
    deactivate API

    UI->>User: Displays Verified Defect, 8.0x Multiplier & Tri-Lingual Notice
    User->>UI: Clicks Audio Narration (Web Speech API plays localized notice)
```

---

## 4. Multimodal Spatial Vision Defect Triage Pipeline

```mermaid
flowchart LR
    Upload["Raw Camera / Screen Image"] --> BayerCheckBayer Sensor & Noise Check
    BayerCheck -->|"Synthetic / AI Fake"| FlagFake["Flag AI-Generated Image\n(Reject / Manual Audit)"]
    BayerCheck -->|"Authentic Physical Capture"| VisionPipeline["Gemini 2.5 Flash Spatial Vision"]

    subgraph SpatialAnalysis ["Spatial Coordinate & Physics Analysis"]
        VisionPipeline --> UserReticle["Inspect User-Drawn Reticle\n[ymin, xmin, ymax, xmax]"]
        VisionPipeline --> ScanChassis["Scan Remaining Chassis\nfor Unannotated Cosmetic Marks"]
        UserReticle --> ClassifyPrimary["Primary Structural Defect:\nDisplay Bezel Clip Fracture"]
        ScanChassis --> ClassifyCosmetic["Secondary Mark:\nMinor Scratch on Top Lid"]
        ClassifyPrimary & ClassifyCosmetic --> EuclideanCalc["Euclidean Distance Calculation\nDistance = 142.5 mm > 140 mm"]
    end

    EuclideanCalc --> Verdict["Defect Causation:\nTensile Torque Overstress\n(Non-Impact Manufacturing Flaw)"]
```

---

## 5. 6-State Autonomous Dispute Resolution Loop

```mermaid
stateDiagram-v2
    [*] --> DEFECT_DETECTED: Optical Image & Reticle Analyzed
    DEFECT_DETECTED --> EVIDENCE_LOCKED: SHA-256 Frame Hash & Fernet Lock
    EVIDENCE_LOCKED --> QUOTE_AUDITED: Price Gouging Multiplier >= 2.0x
    QUOTE_AUDITED --> DEMAND_ISSUED: 48h Formal Statutory Notice Dispatched
    DEMAND_ISSUED --> WAITING_FOR_MANUFACTURER: SLA Timer Commences (48h Remaining)
    
    WAITING_FOR_MANUFACTURER --> CLAIM_SETTLED: OEM Grants 100% Free Repair
    WAITING_FOR_MANUFACTURER --> ESCALATED_E_JAGRITI: SLA Timeout (48h Expired Without Resolution)
    
    ESCALATED_E_JAGRITI --> [*]: District Consumer Commission e-Filing Under Sec 35
    CLAIM_SETTLED --> [*]: Warranty Repaired with Zero Out-of-Pocket Expense
```

---

## 6. Security, Privacy & Chain-of-Custody Cryptographic Model

```mermaid
flowchart TD
    subgraph Ingestion ["Ingestion & Boundary Protection"]
        RawImage["User Device Photo"]
        RawInvoice["Service Quotation PDF / Slip"]
        UserData["Customer Name, Phone, Serial No."]
    end

    subgraph CryptographicOperations ["Zero-Knowledge Evidence Hardening"]
        HashImg["Compute SHA-256 (Raw Image)"]
        HashInv["Compute SHA-256 (Invoice)"]
        PIIScrubber["RegEx PII Scrubber\n(Anonymizes Phone, Address, Email)"]
        FernetEnc["Fernet AES-128-CBC + HMAC-SHA256 Encryption"]
    end

    subgraph VerifiedArtifacts ["Court-Admissible Evidence Bundle"]
        ImmutableHash["SHA-256 Evidence Lock\n(Tamper-Proof Hardware Ledger)"]
        EncryptedPayload["Fernet Encrypted Telemetry Ciphertext"]
        LegalExport["e-Jagriti Sec 35 Formal Complaint Package"]
    end

    RawImage --> HashImg --> ImmutableHash
    RawInvoice --> HashInv --> ImmutableHash
    UserData --> PIIScrubber --> FernetEnc --> EncryptedPayload
    ImmutableHash & EncryptedPayload --> LegalExport
```

---

## 7. Technology Stack & Component Bill of Materials

| Layer | Component | Version / Specification | Role in NyayShield AI |
| :--- | :--- | :--- | :--- |
| **Edge Client** | React + Vite | 18.3.1 / Vite 5.4.19 | Ultra-responsive mobile PWA client (`max-w-[430px]`) |
| **Styling & UI** | Tailwind CSS + Lucide | 3.4.17 / Lucide Icons | Accessible dark-mode theme, interactive reticle canvas |
| **Audio Engine** | Web Speech API | Native Browser Synthesis | Multi-lingual voice playback (`en-IN`, `hi-IN`, `bn-IN`) |
| **API Gateway** | FastAPI | 0.115.6 + Uvicorn | High-throughput asynchronous REST gateway with CORS |
| **Data Contracts** | Pydantic v2 | 2.10.4 | Strict type validation and OpenAPI JSON schema generation |
| **Primary Vision** | Google Gemini 2.5 Flash | `gemini-2.5-flash` | Multimodal spatial defect reticle triage and OEM part tagging |
| **Legal Critic** | Google Gemma 3 | `gemma-3-27b-it` / `gemini-2.5-pro` | Grounded statutory criticism under Consumer Protection Act 2019 |
| **Cryptography** | Cryptography (Python) | Fernet (AES-128-CBC + HMAC) | PII anonymization and zero-knowledge claim telemetry encryption |
| **Tunnel / Edge** | Cloudflare Tunnel | `trycloudflare.com` | Zero-latency external mobile testing gateway |
