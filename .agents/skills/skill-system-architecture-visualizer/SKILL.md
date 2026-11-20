---
name: skill-system-architecture-visualizer
description: |
  Generates and maintains high-fidelity architectural models, C4 diagrams, sequence diagrams, and cryptographic boundary charts for NyayShield AI. Documents all 6 core engineering feats using Mermaid.js with automated periodic synchronization.
---

# NyayShield AI Architecture & Engineering Visualizer

## 1. Overview & Purpose
This skill codifies the architectural models, system topology, component interactions, and data pipelines for **NyayShield AI**. It enables the automated generation and periodic synchronization of:
1. **C4 Context & Container Models**: User interactions, PWA edge clients, FastAPI API Gateway, Vertex AI, and statutory filing portals.
2. **Multimodal Vision Spatial Triage Pipeline**: Gemini 2.5 Flash 2D bounding box reticle coordinate mapping [ymin, xmin, ymax, xmax].
3. **Forensic Bayer Matrix & Noise Authenticity Gate**: Anti-fake synthetic image detection workflow.
4. **Deterministic Part-Level Price-Gouging Calculation**: BOM catalog cost benchmarking against service center walk-in quotations.
5. **Gemma 3 Statutory Legal Critic & Tri-Lingual Drafter**: Grounded citation verification under CPA 2019 and e-Jagriti Sec 35 in EN, HI, BN.
6. **Zero-Knowledge Evidence Lock & Chain of Custody**: SHA-256 asset hashing, Fernet AES-128 PII redaction, and timestamped audit logs.
7. **6-State Autonomous Dispute Resolution Loop**: End-to-end CRM demand and judicial escalation state machine.

All diagrams are standardized in **GitHub-Flavored Mermaid.js** syntax and stored in `docs/ARCHITECTURE.md`.

## 2. Diagramming Standards (Google / Karpathy Rigor)
- **Safe Syntax Only**: Avoid unescaped special characters in Mermaid node labels (always use double quotes: `id["Label (Context)"]`).
- **Directional Clarity**: Use `flowchart TD` for top-to-bottom pipeline processing and `flowchart LR` for horizontal data transformations.
- **Component Subgraphs**: Group systems by operational boundary (`Client Edge PWA`, `Secure API Gateway`, `Google AI / Cloud Services`, `Statutory & Audit Layer`).
- **Sequence Lifecycles**: Include activation boxes (`activate / deactivate`) on participants in `sequenceDiagram`.
- **State Invariants**: Specify guard conditions `[condition]` on state transitions.

## 3. The 6 Engineering Feats Documented

```
┌────────────────────────────────────────────────────────────────────────┐
│                   NYAYSHIELD AI 6 CORE ENGINEERING FEATS               │
├───────────────────────────────────┬────────────────────────────────────┤
│ 1. Multimodal Spatial Reticle     │ 4. Grounded Legal Critic (Gemma 3) │
│    Gemini 2.5 Flash Bounding Box  │    Statutory validation in EN/HI/BN│
├───────────────────────────────────┼────────────────────────────────────┤
│ 2. Anti-Fake Authenticity Gate    │ 5. Cryptographic Evidence Lock     │
│    Bayer sensor & optical noise   │    SHA-256 + Fernet AES-128 PII    │
├───────────────────────────────────┼────────────────────────────────────┤
│ 3. Part-Level Price-Gouging Engine│ 6. 6-State Dispute Escalation Loop │
│    Deterministic 2.0x+ multiplier │    48-hour SLA automated transition│
└───────────────────────────────────┴────────────────────────────────────┘
```

## 4. Execution Workflow

### Step 1: Automated Diagram Generation
Run the synchronization script to rebuild all architectural models:
```powershell
python scripts/sync_docs_and_diagrams.py --diagrams-only
```

### Step 2: Live Verification
- Ensure `docs/ARCHITECTURE.md` renders cleanly on GitHub and markdown previewers.
- Check that the interactive Architecture tab in the frontend Judge Drawer displays the updated diagrams and tech stack metrics.
