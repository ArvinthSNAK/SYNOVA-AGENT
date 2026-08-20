"""
NCB (No Claim Bonus) Calculator.

NCB percentages are configurable per insurer/product via DB.
Defaults follow standard Indian motor insurance NCB slabs.
"""

DEFAULT_NCB_SLABS = {
    0: 0.0,
    1: 20.0,
    2: 25.0,
    3: 35.0,
    4: 45.0,
    5: 50.0,
}


def calculate_ncb(
    claim_free_years: int,
    previous_ncb_percent: float = 0.0,
    had_claim_last_year: bool = False,
    ncb_slabs: dict[int, float] | None = None,
) -> dict:
    """
    Calculate NCB based on claim history.

    Args:
        claim_free_years: Number of consecutive years without claims
        previous_ncb_percent: NCB from previous policy
        had_claim_last_year: Whether a claim was made in the last policy year
        ncb_slabs: Configurable slab table (DB-driven in production)

    Returns:
        {
            "claim_free_years": 3,
            "had_claim_last_year": False,
            "ncb_percent": 35.0,
            "ncb_status": "eligible",
            "next_year_ncb": 45.0,
            "note": ""
        }
    """
    slabs = ncb_slabs or DEFAULT_NCB_SLABS

    if had_claim_last_year:
        return {
            "claim_free_years": 0,
            "had_claim_last_year": True,
            "ncb_percent": 0.0,
            "ncb_status": "reset",
            "next_year_ncb": slabs.get(1, 20.0),
            "note": "NCB reset due to claim in last policy year",
        }

    max_years = max(slabs.keys())
    effective_years = min(claim_free_years, max_years)
    ncb_percent = slabs.get(effective_years, 0.0)

    next_year = min(effective_years + 1, max_years)
    next_year_ncb = slabs.get(next_year, ncb_percent)

    return {
        "claim_free_years": claim_free_years,
        "had_claim_last_year": False,
        "ncb_percent": ncb_percent,
        "ncb_status": "eligible" if ncb_percent > 0 else "not_eligible",
        "next_year_ncb": next_year_ncb,
        "note": "",
    }
