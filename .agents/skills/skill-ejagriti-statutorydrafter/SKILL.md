---
name: skill-ejagriti-statutorydrafter
description: |
  Drafts Consumer Protection Act 2019 Sec 2(11) & e-Jagriti Sec 35 notices in EN/HI/BN with mandatory Gemma 3 citation verification. Use when generating legal notices or preparing e-Daakhil complaints.
---

# e-Jagriti Statutory Drafter & Adversarial Gemma 3 Critic Rule

## Overview
This skill governs the statutory legal drafting and adversarial critic verification engine of **NyayShield AI**. It generates binding pre-litigation notices and 48-Hour CRM Job Sheet Demands under the *Consumer Protection Act, 2019* in three languages (**English**, **Hindi**, and **Bengali**), enforcing a strict **0% hallucinated citation guarantee** via an adversarial Gemma 3 legal critic.

---

## 1. Grounded Statutory Reference List

The legal drafter is strictly restricted to authoritative, gazetted Indian consumer statutes. **No hallucinated sections, fictitious rules, or repealed acts (e.g., CPA 1986) are permitted:**

1. **Consumer Protection Act 2019, Section 2(11):**
   - *Deficiency in Service:* Any fault, imperfection, shortcoming, or inadequacy in quality, nature, and manner of performance required by law or contract.
   - *Application:* Wrongful denial of in-warranty repair by arbitrarily categorizing manufacturing hinge torque fatigue as accidental customer damage.

2. **Consumer Protection Act 2019, Section 2(47):**
   - *Unfair Trade Practice:* Deceptive practices, false representations regarding quality or need for replacement, and charging unjustified, exorbitant prices.
   - *Application:* Demanding ₹20,000 for a broken bezel with an OEM MSRP of ₹2,500 ($8.0\times$ markup), or coercively requiring whole display module replacement.

3. **Consumer Protection Act 2019, Section 35:**
   - *Manner of making complaint before the District Commission:* Governs complaints submitted electronically through the National Consumer Portal (**e-Jagriti / e-Daakhil**).

4. **Consumer Protection (E-Commerce) Rules 2020, Rule 5:**
   - Mandatory transparent pricing, explicit spare parts warranty obligations, and prohibition of unfair pricing.

---

## 2. Mandatory Tri-Lingual Notice Standard

Every legal package generated must provide full actionable drafts in three languages:
- **English:** Formal pre-litigation notice for corporate legal counsel and executive escalations.
- **Hindi (हिंदी):** Formal notice for regional consumer commissions and state consumer affairs directorates across Northern and Central India.
- **Bengali (বাংলা):** Vernacular notice for Eastern India district commissions (e.g., Kolkata District Consumer Disputes Redressal Commission for Live Case #001).

---

## 3. Adversarial Gemma 3 Legal Critic

Before any notice is presented to the user:
1. Run a second critic verification pass (`model="gemma-3"` with `temperature=0.0`).
2. The critic audits every statutory citation against the gazetted list.
3. If any section number does not match CPA 2019, the notice is rejected or auto-corrected.
4. Set `gemma3_judge_verified: true` and record audit reasoning in `critic_verification_notes`.

---

## 4. Human-In-The-Loop (HITL) Gate

- **Safety Invariant:** No notice or legal filing may be dispatched autonomously.
- The user must explicitly inspect the draft on **Screen 3 / Screen 4** and click **"Approve & Dispatch Statutory Notice"** before the 48-Hour SLA countdown timer initiates.
