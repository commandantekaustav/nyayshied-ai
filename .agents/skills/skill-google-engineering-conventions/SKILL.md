---
name: skill-google-engineering-conventions
description: |
  Enforces Google Engineering Practices for code conventions (Python/TypeScript), branch naming schemas (feat/, fix/, test/), conventional commits, and pre-push validation checklists for multi-contributor repositories.
---

# Google Engineering Practices & Conventions

## Overview
This skill codifies **Google Engineering Practices** (Google Style Guides, Code Review Standards, and Chromium/Android branch and commit conventions) for **NyayShield AI**. It establishes uniform standards across teammates working on distributed branches to eliminate naming drift, merge conflicts, and regression.

---

## 1. Branch Naming Conventions (Google / Open Source Standard)

Never use ambiguous branch names like `b1`, `temp`, or personal names without scope like `Ishika-Module`. Instead, use the Google/Git-Flow hierarchical taxonomy:

### Schema: `<category>/<short-kebab-description>`

| Category | Purpose | Example |
| :--- | :--- | :--- |
| `feat/` | New user-facing feature or API capability | `feat/b1-dashboard-view` (instead of `b1`) |
| `test/` | QA test cases, manual testing feedback, bench evals | `test/ishika-hardware-eval` (instead of `Ishika-Module`) |
| `fix/` | Bug fixes, regression patches, hallucination fixes | `fix/phantom-bounding-boxes` |
| `docs/` | Documentation, statutory updates, checklists | `docs/cpa2019-statutory-manifesto` |
| `refactor/`| Code refactoring without behavioral change | `refactor/vertex-client-session` |

---

## 2. How to Safely Rename Previously Pushed Branches

If a branch was already pushed to GitHub with a legacy name (e.g. `b1` or `Ishika-Module`), rename it safely without breaking team history:

### Step 1: Rename Local and Push New Name
```bash
# Checkout the branch you want to rename
git checkout <old-name>

# Rename locally to Google standard
git branch -m <old-name> <category>/<new-name>

# Push the new branch name to GitHub and set upstream tracking
git push origin -u <category>/<new-name>
```

### Step 2: Delete the Old Remote Branch
```bash
git push origin --delete <old-name>
```

*(Alternatively: Go to GitHub Repo -> **Branches** -> click the pencil icon ✏️ next to the branch and enter the new name. GitHub automatically updates open Pull Requests!)*

---

## 3. Commit Message Standard (Conventional Commits)

Format: `<type>(<scope>): <concise imperative description>`

- `feat(vision): integrate gemini-3.8-flash multimodal device identifier`
- `fix(triage): eliminate phantom bounding boxes on clean chassis`
- `docs(tracker): update alpha feedback resolution table`
- `refactor(api): clean up unused form parameters`

### Modifying Previously Pushed Commits (Guideline):
- **Can you modify?** Yes, via `git commit --amend` or `git rebase -i`, followed by `git push --force-with-lease`.
- **Golden Rule:** **Never rewrite shared public history** if teammates have already based work on it. Enforce the new naming convention from the current commit forward.

---

## 4. Coding Conventions

### Python (Google Python Style Guide)
- **Functions & Variables:** `snake_case` (e.g., `perform_spatial_triage`, `walk_in_quote_inr`).
- **Classes & Pydantic Models:** `PascalCase` (e.g., `SpatialTriageResult`, `ClaimAnalysisResponse`).
- **Constants:** `UPPER_SNAKE_CASE` (e.g., `SYSTEM_TRIAGE_INSTRUCTION`).
- **Type Annotations:** Mandatory on all public functions (`def func(param: str) -> bool:`).

### TypeScript / React (Google TypeScript Style Guide)
- **Components & Interfaces:** `PascalCase` (e.g., `IssueTrackerModal`, `Screen2Forensics`).
- **Props & State Variables:** `camelCase` (e.g., `imagePreview`, `walkInQuote`).
- **File Names:** Component files in `PascalCase.tsx`, utility modules in `camelCase.ts`.

---

## 5. Pre-Push Validation Checklist

Run this 4-step checklist before merging or pushing to `main`:

1. **[ ] Type Check & Build:** `npm --prefix frontend run build` (Must transform modules with 0 TypeScript errors).
2. **[ ] Secret Hygiene:** Verify `.env` is ignored and no raw API keys/tokens are committed.
3. **[ ] Backend Health:** Verify FastAPI server starts with all active routes loaded.
4. **[ ] No Phantom Regressions:** Confirm bounding boxes are strictly constrained to genuine physical defects.
