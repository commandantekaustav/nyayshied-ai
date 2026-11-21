---
name: skill-warranty-contractauditor
description: |
  Audits consumer electronics tax invoices, verifies ZEXW warranty exclusion codes, and calculates deterministic part-level price-gouging multipliers (>=2.0x). Use when inspecting service center quotation slips, verifying OEM catalog BOM costs, or evaluating unfair trade practices under CPA 2019 Sec 2(47).
---

# Warranty Contract & Price-Gouging Audit Rule

## Overview
This skill governs the contract verification and price-gouging audit engine of **NyayShield AI**. It audits service center quotation sheets, scrutinizes deceptive warranty repudiation codes (`ZEXW`), and computes mathematical price-gouging ratios against manufacturer Bill of Materials (BOM) master pricing.

---

## 1. Invoice & Quotation Verification Checklist

1. **Mandatory Header Fields:**
   - Authorized Service Partner (e.g., Redington, HP Authorized Service Centre).
   - Reference Job Sheet / Invoice Number (e.g., `SOA370366199413`).
   - Device Model & Serial Number (dynamically detected per device; e.g., HP Victus `15-fa1310tx` — *Golden Case #001 benchmark example only*).
   - Purchase Date & Standard 1-Year / Extended Warranty Window.

2. **ZEXW Exclusion Scrutiny:**
   - Service providers frequently attach exclusion code **`ZEXW`** (*Customer Induced Damage / Accidental Wear*) to deny valid warranty coverage.
   - **Audit Action:** Cross-reference `ZEXW` tagging against spatial defect triage (`skill-spatial-forensic-triage`). If the primary structural defect is isolated on a clean chassis (`0.0 mm` separation, zero secondary impact marks) or separated by any non-zero physical distance (`>0 mm`) across distinct chassis planes from unrelated cosmetic wear, flag the `ZEXW` rejection as a bad-faith **Deficiency in Service** under *Consumer Protection Act 2019, Section 2(11)*.

---

## 2. Deterministic Price-Gouging Rule Engine

1. **Mathematical Multiplier Formula:**
   $$\text{price\_gouging\_multiplier} = \frac{\text{walk\_in\_quote\_inr}}{\text{fair\_oem\_cost\_inr}}$$

2. **Severity Thresholds:**
   - $\ge 3.5\times$: **`EXTREME_GOUGING`** (e.g., ₹20,000 quote vs. ₹2,500 OEM bezel = **8.0×**).
   - $\ge 2.0\times$: **`SIGNIFICANT_GOUGING`** (Predatory markup).
   - $\ge 1.3\times$: **`MODERATE_MARKUP`**.
   - $< 1.3\times$: **`FAIR_PRICING`**.

3. **Forced Assembly Bundling Detection:**
   - Flag service centers demanding full display panel / lid replacement (e.g., ₹18,000–₹22,000) when only an individual sub-component such as an external clip-on B-cover bezel (e.g., `N13327-001`, MSRP ₹2,500 — *Golden Case #001 benchmark example only*) is damaged.
   - Forced assembly replacement constitutes an **Unfair Trade Practice** under *Consumer Protection Act 2019, Section 2(47)* and *Consumer Protection (E-Commerce) Rules 2020, Rule 5*.

---

## 3. Cryptographic Non-Repudiation Lock

- Every uploaded invoice or job sheet must be anchored with an immutable cryptographic digest:
  $$\text{invoice\_sha256} = \text{SHA-256}(\text{invoice\_bytes})$$
- PII (customer contact details, payment info) must be encrypted via **Fernet (AES-128-CBC + HMAC-SHA256)** before persistent logging to `metrics.jsonl`.
