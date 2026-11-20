# NyayShield AI — Team Engineering Guidelines & Conventions
*(Aligned with Google Engineering Practices & Conventional Commits)*

## 1. Branch Naming Standard

All teammates should adopt the `<type>/<feature-name>` convention to avoid collision and keep work organized:

| Old / Ambiguous Name | Recommended Google Standard | Owner |
| :--- | :--- | :--- |
| `b1` | `feat/b1-claims-enhancement` | Anwesha |
| `Ishika-Module` | `test/ishika-hardware-eval` | Ishika |
| `main` | `main` (Production / Stable Release) | Kaustav (Lead) |

### How to Rename a Pushed Branch on GitHub:
1. **GitHub UI (Easiest & Safest):**
   - Go to: `https://github.com/commandantekaustav/nyayshied-ai/branches`
   - Click the **pencil ✏️ icon** next to `b1` or `Ishika-Module`.
   - Rename to `feat/b1-claims-enhancement` or `test/ishika-hardware-eval`.
   - GitHub will automatically redirect open PRs and notify the team!
2. **Via Terminal:**
   ```bash
   git checkout b1
   git branch -m b1 feat/b1-claims-enhancement
   git push origin -u feat/b1-claims-enhancement
   git push origin --delete b1
   ```

---

## 2. Commit Message Convention

Format: `<type>(<scope>): <summary in imperative mood>`
- `feat(triage): ...` for new capabilities.
- `fix(vision): ...` for bug fixes.
- `docs(tracker): ...` for documentation and checklists.
- `test(hardware): ...` for test cases and evaluation logs.

---

## 3. Pre-Flight Validation Checklist

Before requesting a merge into `main`:
- [ ] **Type Check & Build:** Run `npm --prefix frontend run build` (0 TypeScript errors).
- [ ] **Zero Phantom Detections:** Verify single-defect images do not hallucinate secondary boxes.
- [ ] **Secrets Check:** Never commit `.env` or raw API keys.
- [ ] **FastAPI Reload Check:** Backend boots with `GET /api/health` returning `200 OK`.
