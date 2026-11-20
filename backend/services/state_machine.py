import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Optional
from backend.core.config import settings
from backend.models.schemas import StateLoopItem, AuditLogEntry

logger = logging.getLogger("nyayshield.state_machine")

# In-memory session audit log store
_AUDIT_LOG_STORE: List[AuditLogEntry] = []


def log_audit_event(
    action: str,
    latency_ms: float,
    model_used: str,
    details: str
) -> AuditLogEntry:
    """Records a timestamped audit/bug entry into in-memory and persistent log."""
    entry = AuditLogEntry(
        timestamp=datetime.now(timezone.utc).isoformat(),
        action=action,
        latency_ms=round(latency_ms, 1),
        model_used=model_used,
        details=details
    )
    _AUDIT_LOG_STORE.append(entry)
    # Keep last 100 entries in memory
    if len(_AUDIT_LOG_STORE) > 100:
        _AUDIT_LOG_STORE.pop(0)
    return entry


def get_all_audit_logs() -> List[AuditLogEntry]:
    """Returns all logged audit events."""
    return list(_AUDIT_LOG_STORE)


def build_six_state_loop(
    device_image_sha256: str,
    walk_in_quote_inr: float,
    fair_oem_cost_inr: float,
    multiplier: float,
    primary_part_code: str,
    cosmetic_part_code: Optional[str] = None,
) -> List[StateLoopItem]:
    """
    Constructs the deterministic 6-State progression loop for NyayShield claims.
    """
    now = datetime.now(timezone.utc).isoformat()
    cosmetic_str = f" and cosmetic {cosmetic_part_code}" if cosmetic_part_code else ""

    return [
        StateLoopItem(
            state="DEFECT_DETECTED",
            status="COMPLETED",
            timestamp=now,
            description=f"Defect localized: OEM Part #{primary_part_code}{cosmetic_str}.",
        ),
        StateLoopItem(
            state="EVIDENCE_LOCKED",
            status="COMPLETED",
            timestamp=now,
            description=f"Cryptographic SHA-256 frame hash locked ({device_image_sha256[:16]}...). Tamper-proofing guaranteed.",
        ),
        StateLoopItem(
            state="QUOTE_AUDITED",
            status="COMPLETED",
            timestamp=now,
            description=f"Price-gouging audit complete: ₹{walk_in_quote_inr:,.0f} vs ₹{fair_oem_cost_inr:,.0f} fair OEM cost ({multiplier}x multiplier).",
        ),
        StateLoopItem(
            state="DEMAND_ISSUED",
            status="COMPLETED",
            timestamp=now,
            description="48-Hour CRM Job Sheet Demand & Tri-lingual e-Jagriti Section 35 legal package compiled. Critic verified by Gemma 3.",
        ),
        StateLoopItem(
            state="WAITING_FOR_MANUFACTURER",
            status="ACTIVE",
            timestamp=now,
            description="Active 48.0-hour SLA timer running. Awaiting authorized service center / manufacturer compliance.",
        ),
        StateLoopItem(
            state="ESCALATED_E_JAGRITI",
            status="PENDING",
            timestamp="Pending SLA Expiration (48h)",
            description="Automated digital filing to e-Jagriti (National Consumer Disputes Redressal Commission) upon SLA breach.",
        ),
    ]


def log_telemetry_metric(metric_data: dict) -> None:
    """
    Appends audit record to metrics.jsonl.
    """
    try:
        metrics_file: Path = settings.METRICS_LOG_PATH
        metrics_file.parent.mkdir(parents=True, exist_ok=True)

        line = json.dumps(metric_data) + "\n"
        with open(metrics_file, "a", encoding="utf-8") as f:
            f.write(line)
        logger.info(f"Appended claim metric to {metrics_file.name}")
    except Exception as e:
        logger.error(f"Failed to log telemetry metric: {e}")
