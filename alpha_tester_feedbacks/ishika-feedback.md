# Tester's perspective (Alpha Tester: Ishika)

~~1. when I uploaded my image, after dragging the square it shows the damage message but it also shows 168mm (>140)mm criteria and shows some unrelated damage pointing to a random area that is even not on the device.~~  
~~note- remove the criteria of >140mm it is coming from the hardcoded example.~~  
~~we can remove the criteria totally and find the distance according to the actual damage that it detects other than the marked square.~~  
> **[RESOLVED - 2026-11-21]**: 
> - **Anti-Phantom Rule Deployed**: Removed prompt coordinate injection (`[780, 720, 850, 840]`) that caused phantom bounding boxes on empty/background areas. If no secondary defect exists, model returns `unannotated_damages: []` and exactly 1 verified box.
> - **Arbitrary >140mm Criteria Removed**: Removed all fixed `>140 mm` thresholds and hardcoded `168.4 mm`.
> - **Dynamic Distance Engine**: When secondary damage is detected on chassis, Euclidean distance is calculated dynamically between centers. If single defect, separation is `0.0 mm` and reports: *"Single isolated defect localized. Clean chassis with 0 secondary impact marks."*

---

~~2. given image is HP Pavallion still it shows HP victus.~~  
> **[RESOLVED - 2026-11-21]**: 
> - **Auto-Identification & Neutral Defaults**: Cleared hardcoded `"Victus 15-fa1310tx"` defaults from frontend input state, placeholder, API services, and backend form fields.
> - **Multimodal Vision Model Guidance (`skill-device-visual-identifier`)**: Instructed Gemini 3.5-Flash to visually inspect chassis badging, lid logo, keyboard font, and deck styling to distinguish between **HP Pavilion**, **HP Victus**, **Dell**, **Lenovo**, etc.
> - **Brand-Aware OEM Cataloging**: Part codes dynamically format to detected series (e.g., `OEM-HP-BEZEL-01` / `HP Pavilion Display Bezel / Hinge Assembly`) rather than forcing HP Victus N13327-001.
