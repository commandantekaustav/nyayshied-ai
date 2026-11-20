---
name: skill-automated-doc-engine
description: |
  Automated Continuous Technical Documentation Engine for NyayShield AI. Automatically parses FastAPI endpoints, Pydantic schemas, React components, state machines, and statutory citations to produce and continuously refresh comprehensive system documentation, API contracts, and changelog audit files.
---

# Automated Continuous Technical Documentation Engine

## 1. Overview & Purpose
This skill establishes an automated, continuously synchronized documentation pipeline for **NyayShield AI**. Whenever new endpoints, schemas, React UI components, or statutory legal provisions are modified, this engine updates:
1. `docs/SYSTEM_DOCUMENTATION.md` (End-to-end architecture, user workflows, security and compliance layers)
2. `docs/API_REFERENCE.md` (FastAPI schema documentation, request/response models, error handling)
3. `docs/CHANGELOG_AUDIT.md` (Timestamped commit log, latency benchmarks, and feature changes)

## 2. Google Technical Writing Conventions
All generated documentation adheres to Google Technical Writing standards:
- **Active Voice & Clear Imperatives**: Document behavior deterministically ("The engine encrypts..." rather than "Data is encrypted by the system").
- **Grounded Ground-Truth Schemas**: Directly quote Pydantic field definitions and type contracts without synthetic drift.
- **Hierarchical Headings**: Strict `# -> ## -> ###` structure for automated table-of-contents generation.
- **Code Fencing**: Explicit language tags (`python`, `typescript`, `json`, `bash`, `mermaid`).
- **Auditability**: Every generated document includes an ISO-8601 UTC timestamp and the Git commit SHA representing its source.

## 3. Core Extraction Targets

| Subsystem | Source Path | Extracted Information | Target Doc |
| :--- | :--- | :--- | :--- |
| **Backend REST Endpoints** | `backend/main.py` | Route signatures, status codes, query/form params | `docs/API_REFERENCE.md` |
| **Data Contracts** | `backend/models/schemas.py` | Pydantic field models, enums, validators | `docs/API_REFERENCE.md` |
| **Frontend Component Tree** | `frontend/src/components/` | Screen states, props interfaces, user actions | `docs/SYSTEM_DOCUMENTATION.md` |
| **Statutory Knowledge Base** | `backend/services/legal_drafter.py` | CPA 2019 provisions, e-Jagriti Sec 35, citations | `docs/SYSTEM_DOCUMENTATION.md` |
| **Security & Cryptography** | `backend/core/security.py` | Fernet AES-128, SHA-256 evidence lock, PII scrub | `docs/SYSTEM_DOCUMENTATION.md` |
| **Audit & Latency Telemetry** | `backend/services/state_machine.py` | 6-state cycle, latency logging, audit events | `docs/CHANGELOG_AUDIT.md` |

## 4. Execution Workflow

### Step 1: Codebase Introspection
Run the automated documentation generation script:
```powershell
python scripts/sync_docs_and_diagrams.py --docs-only
```

### Step 2: Verification Checklist
Verify that:
- [ ] All routes in `backend/main.py` match the endpoints listed in `docs/API_REFERENCE.md`.
- [ ] Every field in `ClaimAnalysisResponse` is documented with its unit/type.
- [ ] Web Speech API language codes (`en-IN`, `hi-IN`, `bn-IN`) are accurately listed.
- [ ] Timestamps reflect the latest build execution.

### Step 3: Automated Periodic Execution
To maintain live synchronization, run the watchdog daemon or trigger the script during git pre-commit:
```powershell
# Continuous file-watch update mode
python scripts/sync_docs_and_diagrams.py --watch
```
