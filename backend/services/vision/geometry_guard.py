import math
from typing import List, Literal, Optional


def normalize_box(raw_box: Optional[List[int]]) -> Optional[List[int]]:
    """
    Validates and clamps a [ymin, xmin, ymax, xmax] bounding box onto the
    0-1000 integer coordinate grid, rejecting degenerate boxes (<5 units wide/tall).
    """
    if not isinstance(raw_box, (list, tuple)) or len(raw_box) != 4:
        return None
    try:
        vals = [int(round(float(v))) for v in raw_box]
    except Exception:
        return None
    ymin, xmin, ymax, xmax = [max(0, min(1000, v)) for v in vals]
    if ymin >= ymax or xmin >= xmax:
        return None
    if (ymax - ymin) < 5 or (xmax - xmin) < 5:
        return None
    return [ymin, xmin, ymax, xmax]


def constrain_to_user_reticle(
    detected_box: Optional[List[int]],
    user_box: Optional[List[int]],
    pad_margin: int = 120,
) -> Optional[List[int]]:
    """
    Post-processing spatial guardrail for Mode 2 (user-marked reticle scans):
    Ensures the model's returned defect_box overlaps the user's drawn reticle
    (expanded by pad_margin on the 0-1000 grid). If the model drifted to an
    unrelated area of the frame (zero overlap), falls back to the user reticle.
    """
    norm_user = normalize_box(user_box)
    norm_det = normalize_box(detected_box)

    if norm_user is None:
        return norm_det
    if norm_det is None:
        return norm_user

    uy1, ux1, uy2, ux2 = norm_user
    exp_y1 = max(0, uy1 - pad_margin)
    exp_x1 = max(0, ux1 - pad_margin)
    exp_y2 = min(1000, uy2 + pad_margin)
    exp_x2 = min(1000, ux2 + pad_margin)

    dy1, dx1, dy2, dx2 = norm_det
    inter_y = min(dy2, exp_y2) - max(dy1, exp_y1)
    inter_x = min(dx2, exp_x2) - max(dx1, exp_x1)

    if inter_y <= 0 or inter_x <= 0:
        return norm_user
    return norm_det


def enforce_physics_classification_invariant(
    raw_classification: Optional[str],
    impact_point_present: bool,
) -> str:
    """
    Deterministic Physics-First invariant:
    If the model observed a blunt-force impact point, radial shatter, or crushed corner
    (impact_point_present == True), the classification MUST be "Physical/Accidental Damage".
    """
    if impact_point_present:
        return "Physical/Accidental Damage"
    return (raw_classification or "").strip()


def map_classification(
    raw_label: Optional[str],
    impact_point_present: bool = False,
) -> Literal["MANUFACTURING_DEFECT", "COSMETIC_WEAR", "IMPACT_DAMAGE", "NORMAL_WEAR"]:
    """
    Applies the Physics-First invariant and maps model classification strings
    faithfully into canonical NyayShield enums.
    """
    guarded_label = enforce_physics_classification_invariant(raw_label, impact_point_present)
    text = guarded_label.lower()
    if "physical" in text or "accidental" in text or "impact" in text or "drop" in text or text == "impact_damage":
        return "IMPACT_DAMAGE"
    if "manufacturing" in text or text == "manufacturing_defect":
        return "MANUFACTURING_DEFECT"
    if "cosmetic" in text or text == "cosmetic_wear":
        return "COSMETIC_WEAR"
    if "normal" in text or text == "normal_wear":
        return "NORMAL_WEAR"
    return "COSMETIC_WEAR" if "scratch" in text or "scuff" in text else "MANUFACTURING_DEFECT"


def compute_separation_mm(
    box_a: List[int],
    box_b: List[int],
    chassis_ref_mm: float = 360.0,
) -> float:
    """Computes centroid-to-centroid Euclidean distance in mm on a normalized 0-1000 grid."""
    cy1, cx1 = (box_a[0] + box_a[2]) / 2.0, (box_a[1] + box_a[3]) / 2.0
    cy2, cx2 = (box_b[0] + box_b[2]) / 2.0, (box_b[1] + box_b[3]) / 2.0
    norm_dist = math.sqrt((cx1 - cx2) ** 2 + (cy1 - cy2) ** 2)
    return round((norm_dist / 1000.0) * chassis_ref_mm, 1)
