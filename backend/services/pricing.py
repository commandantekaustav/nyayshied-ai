from backend.models.schemas import PriceGougingAudit


def audit_price_gouging(walk_in_quote_inr: float, fair_oem_cost_inr: float) -> PriceGougingAudit:
    """
    Step 2: Price-Gouging Rule Engine.
    Deterministically computes price gouging metrics against OEM catalog baseline:
    price_gouging_multiplier = walk_in_quote_inr / fair_oem_cost_inr
    """
    fair_cost = max(1.0, fair_oem_cost_inr)
    quote = max(0.0, walk_in_quote_inr)

    multiplier = round(quote / fair_cost, 2)
    excess = max(0.0, round(quote - fair_cost, 2))

    if multiplier >= 3.5:
        severity = "EXTREME_GOUGING"
    elif multiplier >= 2.0:
        severity = "SIGNIFICANT_GOUGING"
    elif multiplier >= 1.3:
        severity = "MODERATE_MARKUP"
    else:
        severity = "FAIR_PRICING"

    is_gouging = multiplier >= 1.3

    return PriceGougingAudit(
        walk_in_quote_inr=quote,
        fair_oem_cost_inr=fair_cost,
        price_gouging_multiplier=multiplier,
        excess_unjustified_inr=excess,
        gouging_severity=severity,
        is_gouging_detected=is_gouging,
        statutory_violation="Consumer Protection Act 2019, Section 2(47) - Unfair Trade Practice & Predatory Markup",
    )
