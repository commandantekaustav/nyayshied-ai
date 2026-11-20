---
name: skill-anti-phantom-vision-eval
description: |
  Karpathy-style prompt engineering and evaluation protocol to eliminate phantom bounding boxes, background hallucinations, and forced secondary defects in multimodal spatial vision models.
---

# Anti-Phantom Spatial Vision & Zero-Hallucination Protocol

## Principle (Inspired by Karpathy's LLM/VLM Failure Mode Analysis)
Vision-Language Models (VLMs) have a strong prior to "fill in the schema". When a prompt's JSON example contains a secondary bounding box or fixed distance key, the VLM will frequently output coordinates pointing to arbitrary background pixels, table textures, or clean chassis areas to satisfy the schema expectation.

---

## 1. Zero-Shot Negative Constraints
To eliminate phantom detections:
1. **Never provide literal sample coordinate tuples** like `[780, 720, 850, 840]` in the prompt's few-shot schema. Instead, use schema descriptions or explicitly show empty list `[]` as the default expected state.
2. **Explicit Null Instruction:**
   ```
   "unannotated_damages": [] (Return empty list [] if no secondary damage is visible on the device. Do NOT invent or mark clean areas or the background).
   ```
3. **Conditioned Euclidean Distance:**
   - If `len(boxes) <= 1`, then `euclidean_separation_mm = 0.0`.
   - Never output a static or pre-cooked distance (like 168.4mm). Compute actual physical separation only if two verified, spatially distinct defect locations exist on the physical device.

---

## 2. Dynamic Spatial Distance Computation

When two genuine defects exist on the device:
```python
def compute_chassis_distance_mm(box1, box2, estimated_chassis_width_mm=360.0):
    # box format: [ymin, xmin, ymax, xmax] normalized 0-1000
    cy1 = (box1[0] + box1[2]) / 2.0
    cx1 = (box1[1] + box1[3]) / 2.0
    cy2 = (box2[0] + box2[2]) / 2.0
    cx2 = (box2[1] + box2[3]) / 2.0
    
    # Normalized Euclidean distance (0 to ~1414)
    norm_dist = ((cx1 - cx2)**2 + (cy1 - cy2)**2)**0.5
    # Scale to typical 15.6" laptop width (approx 360 mm)
    actual_mm = (norm_dist / 1000.0) * estimated_chassis_width_mm
    return round(actual_mm, 1)
```
