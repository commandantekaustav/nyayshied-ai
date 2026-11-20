---
name: skill-optical-defect-triage
description: |
  Isolates covered hardware chassis defects from unrelated cosmetic wear using normalized 2D bounding boxes [ymin, xmin, ymax, xmax] (0-1000 scale) and real spatial separation. Automatically adapts to any laptop brand (HP Pavilion, Victus, Dell, Lenovo, Apple, Asus) with zero phantom detections when only a single defect is present.
---

# Optical Defect Triage & Spatial Separation Rule (Dynamic & Anti-Phantom)

## Overview
This skill governs the computer vision and spatial defect triage workflow of **NyayShield AI** to counter deceptive warranty rejections by authorized service centers. Service centers often weaponize minor cosmetic marks to falsely claim "customer drop trauma" and repudiate warranty repairs on factory structural defects (e.g., overtightened hinge torque failures, bezel clip separation, solder fractures).

---

## 1. Dynamic Device Identification & Single-Defect Integrity

1. **Device Brand & Model Agnosticism:**
   - Never force hardcoded models (e.g. HP Victus). Automatically recognize or accept the actual model (e.g., HP Pavilion, HP Envy, Dell Inspiron, Lenovo ThinkPad, Asus TUF, Acer Swift).
   - OEM Part nomenclature must dynamically reflect the detected brand and sub-assembly (e.g. `HP-PAV-BEZEL-01` for HP Pavilion).

2. **Strict Anti-Phantom Bounding Box Rule:**
   - **Do NOT hallucinate or fabricate secondary bounding boxes** outside the device or on clean chassis areas.
   - If the user marked a box and no other visible defects exist on the chassis:
     - Return exactly one primary defect bounding box.
     - `unannotated_damages: []` (empty list).
     - `euclidean_separation_mm: 0.0`.
     - Report: *"Single isolated defect localized. Clean chassis with 0 secondary impact marks."*

---

## 2. Dynamic Separation Protocol (When Secondary Damage Actually Exists)

1. **Genuine Physical Wear Detection:**
   - Only annotate a secondary region if genuine visible scratches, scuffs, or cosmetic wear exist ON the laptop chassis.
   - Never place a bounding box on the background, desk, or out-of-frame areas.

2. **Actual Spatial Separation (No Fixed Threshold Dogma):**
   - Measure real physical distance between center of primary mechanical failure and center of secondary cosmetic mark:
     $$d_{\text{physical}} = \sqrt{(x_{\text{primary}} - x_{\text{secondary}})^2 + (y_{\text{primary}} - y_{\text{secondary}})^2} \times \text{chassis\_scale}$$
   - Report the actual calculated millimeters without forcing an artificial `>140 mm` requirement.
   - Any non-zero physical distance separating an internal mechanical hinge/bezel failure from an isolated surface cosmetic scratch provides evidence that the cosmetic scratch did not cause the structural mechanical failure.

---

## 3. Vertex AI Multimodal Configuration

- **SDK:** Google GenAI Unified SDK (`google-genai`).
- **Model:** `gemini-3.5-flash` or `gemini-2.5-pro` via Vertex AI / API Key.
- **Config:**
  - `temperature: 0.0`
  - `response_mime_type: "application/json"`
  - Enforce schema validation on coordinates `[ymin, xmin, ymax, xmax]` in range `0..1000`.
