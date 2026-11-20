import io
import json
from fastapi.testclient import TestClient
from backend.main import app
from backend.core.security import encrypt_text, decrypt_text, scrub_pii, compute_sha256
from backend.services.pricing import audit_price_gouging

client = TestClient(app)


def test_fernet_encryption():
    test_str = "Customer: Ramesh Kumar | HP Victus 15-fa | Invoice: SOA370366199413"
    encrypted = encrypt_text(test_str)
    assert encrypted != test_str
    decrypted = decrypt_text(encrypted)
    assert decrypted == test_str
    print("✅ Fernet AES-128-CBC + HMAC encryption/decryption verified.")


def test_pii_scrubber():
    text_with_pii = "Contact test@example.com or +919876543210 for claim on https://hpsupport.com"
    scrubbed = scrub_pii(text_with_pii)
    assert "[EMAIL]" in scrubbed
    assert "[PHONE]" in scrubbed
    assert "[URL]" in scrubbed
    assert "test@example.com" not in scrubbed
    print("✅ PII Scrubber verified.")


def test_price_gouging_engine():
    audit = audit_price_gouging(walk_in_quote_inr=20000.0, fair_oem_cost_inr=2500.0)
    assert audit.price_gouging_multiplier == 8.0
    assert audit.excess_unjustified_inr == 17500.0
    assert audit.gouging_severity == "EXTREME_GOUGING"
    assert audit.is_gouging_detected is True
    print(f"✅ Price Gouging Engine verified: {audit.price_gouging_multiplier}x multiplier.")


def test_api_health():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["fernet_active"] is True
    print("✅ GET /api/health verified.")


def test_api_golden_case():
    response = client.get("/api/golden-case")
    assert response.status_code == 200
    data = response.json()
    assert data["claim_id"] == "NYAY-2026-HP-001"
    assert data["pricing"]["price_gouging_multiplier"] == 8.0
    assert data["triage"]["primary_fault_part_code"] == "N13327-001"
    assert data["triage"]["euclidean_separation_mm"] >= 0.0
    assert data["current_state"] == "WAITING_FOR_MANUFACTURER"
    assert data["sla_timer_hours_remaining"] == 48.0
    assert data["legal_package"]["gemma3_judge_verified"] is True
    assert "Consumer Protection Act, 2019" in data["legal_package"]["notice_english"]
    assert "उपभोक्ता संरक्षण अधिनियम" in data["legal_package"]["notice_hindi"]
    assert "উপভোক্তা সুরক্ষা আইন" in data["legal_package"]["notice_bengali"]
    print("✅ GET /api/golden-case verified.")


def test_api_analyze_claim_endpoint():
    # Create dummy 1x1 image bytes
    dummy_image = io.BytesIO(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x06\x00\x00\x00\x1f\x15c4\x00\x00\x00\nIDATx\x9cc\x00\x01\x00\x00\x05\x00\x01\r\n-\xb4\x00\x00\x00\x00IEND\xaeB`\x82")

    files = {
        "device_image": ("laptop_hinge.png", dummy_image, "image/png"),
    }
    data = {
        "walk_in_quote_inr": 20000.0,
    }

    # Test with use_golden_case=true
    response = client.post("/api/analyze-claim?use_golden_case=true", files=files, data=data)
    assert response.status_code == 200
    res_json = response.json()
    assert res_json["current_state"] == "WAITING_FOR_MANUFACTURER"
    assert res_json["sla_timer_hours_remaining"] == 48.0
    assert res_json["pricing"]["price_gouging_multiplier"] == 8.0
    assert res_json["triage"]["euclidean_separation_mm"] >= 0.0
    assert res_json["legal_package"]["gemma3_judge_verified"] is True
    print("✅ POST /api/analyze-claim (use_golden_case=true) verified.")

    # Test with use_golden_case=false (live pipeline execution)
    dummy_image.seek(0)
    files2 = {
        "device_image": ("laptop_hinge.png", dummy_image, "image/png"),
    }
    response2 = client.post("/api/analyze-claim?use_golden_case=false", files=files2, data=data)
    assert response2.status_code == 200
    res2_json = response2.json()
    assert res2_json["current_state"] == "WAITING_FOR_MANUFACTURER"
    assert res2_json["sla_timer_hours_remaining"] == 48.0
    assert res2_json["pricing"]["price_gouging_multiplier"] == 8.0
    assert res2_json["legal_package"]["gemma3_judge_verified"] is True
    assert len(res2_json["state_loop"]) == 6
    print("✅ POST /api/analyze-claim (use_golden_case=false) verified.")


if __name__ == "__main__":
    test_fernet_encryption()
    test_pii_scrubber()
    test_price_gouging_engine()
    test_api_health()
    test_api_golden_case()
    test_api_analyze_claim_endpoint()
    print("\n🎉 ALL TESTS PASSED SUCCESSFULLY!")
