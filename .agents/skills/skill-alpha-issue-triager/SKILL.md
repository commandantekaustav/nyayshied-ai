---
name: skill-alpha-issue-triager
description: |
  Decomposes raw alpha tester feedback into atomic issue components, tracks recurrence frequency, assigns P0/P1 priorities, maps root causes to AI/UI subsystems, and maintains collaborative team synchronization.
---

# Alpha Tester Issue Triage & Multi-Branch Team Sync

## Overview
This skill operationalizes agile user feedback triage for **NyayShield AI** during intensive hackathon and alpha testing sprints. It provides structured protocols to convert unstructured tester reports into discrete, verifiable bug tickets, preventing regression across team branches (`main`, `b1`, etc.).

---

## 1. Triage & Decomposition Protocol

When raw alpha feedback arrives (e.g., from manual testers like Ishika):
1. **Atomic Decomposition:** Never treat a compound sentence as a single issue. Break it down into:
   - **Visual / Spatial Artifacts:** E.g., phantom bounding boxes, canvas misalignment.
   - **Heuristic / Threshold Dogs:** E.g., hardcoded `>140 mm` or `168.4 mm` criteria.
   - **Model Identity / Defaults:** E.g., HP Pavilion defaulting to HP Victus.
2. **Recurrence & Frequency Counter:**
   - Log the number of times a symptom appears across runs or user comments.
   - Frequency $\ge 2\times$ automatically escalates an issue's priority.
3. **Priority Taxonomy:**
   - **P0 (Blocker):** Hallucinations, fake damage detections, incorrect model naming that invalidates statutory notices.
   - **P1 (High):** Erroneous distance measurements, misleading UI tags, confusing defaults.
   - **P2 (Medium):** Layout alignment, color contrast, non-blocking telemetry.

---

## 2. Team Branching & Merging Standards

For teams working across distributed feature branches (e.g., `main` lead by Kaustav, `b1` feature branch by Anwesha, `Ishika-Module` testing branch by Ishika):
1. **Clean Separation of Concerns:**
   - Core API & Shared Types (`types/claim.ts`, `schemas.py`) must remain backwards compatible.
   - Feature branches (like `b1`) should rebase or merge against `main` cleanly without touching generated files (`dist/`).
2. **Git Commit Standards:**
   - Use Conventional Commits: `fix(vision): ...`, `feat(tracker): ...`, `docs(feedback): ...`.
   - Never commit secrets, `.env`, or local venvs.
3. **Verification Before Push:**
   - Run `npm run build` (or `tsc`) to guarantee 0 compile errors.
   - Verify server reload with active routes (`/api/health`, `/api/analyze-claim`, `/api/audit-logs`).
