import io
import json
import threading
from types import SimpleNamespace
from unittest.mock import patch

from PIL import Image

from backend.services.triage import perform_spatial_triage


def _make_sample_jpeg() -> bytes:
    img = Image.new("RGB", (800, 600), (60, 75, 95))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    return buf.getvalue()


def _base_payload(**overrides) -> str:
    data = {
        "is_device": True,
        "brand_name": "HP",
        "identified_product": "HP Pavilion 15",
        "damage_verified": True,
        "identified_part": "Left Display Hinge",
        "oem_part_code": "HP-HNG-01",
        "material_type": "Polycarbonate ABS",
        "surface_texture": "Intact matte finish",
        "stress_indicators": "Internal brass-insert shear",
        "impact_point_present": False,
        "defect_box": [100, 200, 300, 400],
        "classification": "Manufacturing Defect",
        "analysis": "Clean factory seam separation with no exterior drop marks.",
        "fair_oem_cost_inr": 2800.0,
        "is_authentic_photo": True,
        "ai_generated_probability": 0.02,
        "authenticity_notes": "Natural optical sensor noise.",
        "applicable_warranty_clause": "CPA 2019 Sec 2(11)",
        "legal_remedy_summary": "Eligible for free in-warranty repair.",
        "secondary_spots": [],
        "independence_verdict": "Structurally Independent",
        "legal_reasoning": "Internal fatigue failure.",
    }
    data.update(overrides)
    return json.dumps(data)


def test_consensus_box_averaging():
    lock = threading.Lock()
    call_count = 0

    def fake_generate_content(**kwargs):
        nonlocal call_count
        with lock:
            call_count += 1
            idx = call_count
        box = [100, 200, 300, 400] if idx == 1 else [120, 220, 320, 420]
        return SimpleNamespace(text=_base_payload(defect_box=box))

    mock_client = SimpleNamespace(
        models=SimpleNamespace(generate_content=fake_generate_content)
    )

    with patch("backend.services.triage.get_genai_client", return_value=mock_client):
        result = perform_spatial_triage(
            image_bytes=_make_sample_jpeg(),
            brand_name="HP",
            model_name="Pavilion 15",
            user_annotation=[90, 190, 330, 430],
        )

    assert call_count == 2, f"Expected 2 consensus calls, got {call_count}"
    assert result.is_fallback is False
    assert result.bounding_boxes[0].defect_classification == "MANUFACTURING_DEFECT"
    assert result.bounding_boxes[0].box_2d == [110, 210, 310, 410], (
        f"Expected averaged box [110, 210, 310, 410], got {result.bounding_boxes[0].box_2d}"
    )


def test_tie_breaker_majority_vote_with_impact_invariant():
    lock = threading.Lock()
    call_count = 0

    def fake_generate_content(**kwargs):
        nonlocal call_count
        with lock:
            call_count += 1
            idx = call_count
        if idx == 1:
            return SimpleNamespace(
                text=_base_payload(
                    impact_point_present=False,
                    classification="Manufacturing Defect",
                    defect_box=[100, 100, 300, 300],
                )
            )
        if idx == 2:
            # Impact point invariant must force IMPACT_DAMAGE despite raw label
            return SimpleNamespace(
                text=_base_payload(
                    impact_point_present=True,
                    classification="Manufacturing Defect",
                    defect_box=[110, 110, 310, 310],
                )
            )
        return SimpleNamespace(
            text=_base_payload(
                impact_point_present=True,
                classification="Physical/Accidental Damage",
                defect_box=[130, 130, 330, 330],
            )
        )

    mock_client = SimpleNamespace(
        models=SimpleNamespace(generate_content=fake_generate_content)
    )

    with patch("backend.services.triage.get_genai_client", return_value=mock_client):
        result = perform_spatial_triage(
            image_bytes=_make_sample_jpeg(),
            brand_name="HP",
            model_name="Pavilion 15",
            user_annotation=[90, 90, 340, 340],
        )

    assert call_count == 3, f"Expected 3 calls (2 + 1 tie-breaker), got {call_count}"
    assert result.is_fallback is False
    assert result.bounding_boxes[0].defect_classification == "IMPACT_DAMAGE"
    assert result.warranty_covered is False
    assert result.bounding_boxes[0].box_2d == [120, 120, 320, 320], (
        f"Expected majority averaged box [120, 120, 320, 320], got {result.bounding_boxes[0].box_2d}"
    )


if __name__ == "__main__":
    test_consensus_box_averaging()
    test_tie_breaker_majority_vote_with_impact_invariant()
    print("UNIT TESTS PASSED: consensus averaging (2 calls) + tie-breaker majority vote (3 calls)")
