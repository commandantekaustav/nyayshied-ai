---
name: skill-skill-overlap-auditor
description: |
  Meta-skill that audits all `.agents/skills/*/SKILL.md` files for overlapping trigger descriptions, duplicate instructions or formulas, stale or deprecated model IDs (such as retired `gemini-2.0-flash` or `gemini-2.5-flash`), and conflicting rules across skills, then proposes concrete merges or de-duplications with exact file paths and line numbers.
---

# Skill Overlap, Conflict & Stale Model Auditor

## Overview
As a multi-contributor AI repository grows, independently authored skills under `.agents/skills/` accumulate overlapping activation triggers, copy-pasted formulas, contradictory thresholds, and deprecated model identifiers. This meta-skill establishes a repeatable 4-stage audit protocol to keep the skill registry clean, conflict-free, and synchronized with production code.

---

## 1. Four-Stage Audit Protocol

Execute all four stages across every `.agents/skills/<skill-name>/SKILL.md` file:

### Stage 1: Trigger Description & Scope Overlap Scan
1. Parse the YAML frontmatter (`name`, `description`) of every `SKILL.md`.
2. Cluster skills whose `description` fields target the same user intent or subsystem (e.g., spatial bounding boxes, git branching, documentation generation).
3. Flag any pair with competing triggers where an agent could ambiguously load one skill and miss authoritative rules in another.

### Stage 2: Instruction, Formula & Script Duplication Scan
1. Compare core code blocks, mathematical formulas (e.g., Euclidean distance scaling), checklists, and CLI commands across skills.
2. Flag exact or near-exact duplicates (such as two skills invoking the same script or defining the same pre-push checklist) and designate a single source of truth.

### Stage 3: Stale or Invalid Model ID Audit
1. Scan all `SKILL.md` files for model identifiers matching `gemini-*`, `gemma-*`, or marketing names (`Gemini 2.0`, `Gemini 2.5`, `Gemini 3.8`, `Gemma 3`).
2. Cross-check every reference against the active production configuration (`backend/core/config.py`) and valid Vertex AI model endpoints (e.g., `gemini-3.8-flash`, `gemini-3.5-flash`, `gemini-3.5-flash-lite`).
3. Flag deprecated, end-of-life, or abstract model IDs (such as retired `gemini-2.0-flash`, `gemini-2.5-flash`, or bare `model="gemma-3"`).

### Stage 4: Cross-Skill Rule Conflict Detection
1. Compare numerical thresholds, hyperparameters, and invariants across all skills:
   - **Spatial thresholds**: e.g., hardcoded `>140 mm` requirement vs. dynamic non-zero separation.
   - **Inference parameters**: e.g., `temperature: 0.0` vs. `temperature: 0.1`.
   - **Device assumptions**: e.g., hardcoded `HP Victus` model/part codes vs. brand-agnostic identification.
2. Classify each finding by severity:
   - **`P0 Conflict`**: Direct contradiction between two active skills.
   - **`P1 Stale Model`**: Invalid or outdated model ID that causes API errors or documentation drift.
   - **`P2 Redundancy`**: Duplicate instructions or overlapping triggers that inflate context budget.

---

## 2. Standardized Audit Report Format

Every execution of this skill MUST output three structured Markdown tables with **exact file paths and line numbers**:

1. **Overlapping Triggers & Duplicate Instructions Table**:
   - Columns: `Cluster`, `Skills & File Paths`, `Duplicated Logic (Line Numbers)`, `Concrete Merge / De-duplication Proposal`.
2. **Conflicting Rules Table**:
   - Columns: `Conflict ID`, `Severity`, `Skill A (Path & Line)`, `Skill B (Path & Line)`, `Resolution`.
3. **Stale / Invalid Model References Table**:
   - Columns: `File Path`, `Line`, `Stale Reference`, `Recommended Replacement`.

---

## 3. Automated Quick-Scan Commands

Run these read-only commands from the repository root to verify frontmatter health and surface model references quickly:

```powershell
# List all skills and verify YAML frontmatter presence
Get-ChildItem .agents/skills/*/SKILL.md | ForEach-Object { $_.FullName }

# Grep for model IDs and hardcoded thresholds across all skills
Select-String -Path ".agents/skills/*/SKILL.md" -Pattern "gemini-|Gemini |gemma-|140|temperature"
```
