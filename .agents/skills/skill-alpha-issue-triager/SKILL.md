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

## 2. Team Branching, Commits & Pre-Push Verification

For all branch naming (`feat/`, `fix/`, `test/`), Conventional Commits, secret hygiene, and pre-push verification (`npm --prefix frontend run build`, `/api/health`), follow **`skill-google-engineering-conventions`** (`.agents/skills/skill-google-engineering-conventions/SKILL.md`) as the single source of truth.
