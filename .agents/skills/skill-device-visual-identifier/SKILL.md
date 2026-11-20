---
name: skill-device-visual-identifier
description: |
  Identifies OEM consumer electronics device brand, sub-family (e.g., HP Pavilion vs HP Victus vs Dell Inspiron vs Lenovo Legion), form factor, and manufacturing generation using Gemini multimodal vision. Use when analyzing uploaded hardware images with missing or ambiguous user-entered model names.
---

# Google Multimodal Device Visual Identifier

## Overview
This skill implements the Google GenAI multimodal vision pattern for consumer electronic device recognition. When consumers upload damage photos, they frequently omit exact model numbers or misclassify model series (e.g. entering generic "HP" or leaving the field blank when the device is an **HP Pavilion**, **HP Victus**, or **Dell Inspiron**).

---

## 1. Visual Inspection Points for Laptops

1. **Brand & Family Badging:**
   - Detect embossed or silkscreened logos:
     - `HP Circular Logo` vs `Victus V-Shape Logo` vs `Omen Diamond` vs `Pavilion` geometric wordmark.
     - `Dell` encircled typeface on A/C covers.
     - `Lenovo` metallic badge on lid/palmrest edge; `ThinkPad` diagonal red LED dot.
     - `Apple` polished / mirrored apple silhouette.
     - `Asus` / `ROG` Republic of Gamers eye emblem.
     - `Acer` / `Predator` tribal glyph.

2. **Chassis & Bezel Geometry:**
   - **HP Pavilion:** Smooth rounded chassis corners, center hinge bar or dual slender corner hinges, standard silver/blue/gold anodized aluminum or polycarbonate deck.
   - **HP Victus:** Aggressive angular V-notch rear exhaust vents, central high-torque hinge with signature flex gap, dark gunmetal/white matte finish with 'V' emblem.
   - **Dell Inspiron/Vostro:** Drop-hinge lift design (ergolift), rounded edge profile, carbon black or platinum silver deck.

3. **Fallback & Hierarchy of Truth:**
   - If user explicitly supplies a valid specific model string (e.g. "Pavilion 15-eg", "Victus 15-fa"), verify it matches the image.
   - If user leaves model blank or enters a generic brand ("HP"), prioritize visual features to identify the exact sub-line (e.g. "HP Pavilion Series").
   - Never default to a hardcoded flagship model when image markers contradict it.

---

## 2. Multimodal Extraction Prompt Pattern

```python
prompt = """
Examine this laptop photograph carefully:
1. Identify the manufacturer brand (HP, Dell, Lenovo, Apple, Asus, Acer, etc.).
2. Inspect chassis badges, logo shapes, exhaust vent designs, and keyboard font to determine the exact product line (e.g. HP Pavilion, HP Victus, Dell Inspiron, ThinkPad).
3. If no specific sub-badge is visible, classify by form factor (e.g., HP Pavilion 15 Series).
4. Output the identified 'brand_name' and 'device_model' without defaulting to arbitrary models.
"""
```
