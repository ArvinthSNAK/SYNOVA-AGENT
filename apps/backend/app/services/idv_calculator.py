"""
IDV (Insured Declared Value) Calculator.

IDV = Original Invoice Value - Depreciation based on vehicle age.
Depreciation rates are configurable via a table (not hardcoded).
"""

DEFAULT_DEPRECIATION_TABLE = {
    0: 0.0,
    1: 15.0,
    2: 20.0,
    3: 30.0,
    4: 40.0,
    5: 50.0,
}


def calculate_idv(
    invoice_value: float,
    vehicle_age_years: int,
    depreciation_table: dict[int, float] | None = None,
    adjustments: float = 0.0,
) -> dict:
    """
    Calculate IDV based on invoice value and vehicle age.

    Args:
        invoice_value: Original ex-showroom price
        vehicle_age_years: Age of vehicle in years
        depreciation_table: {year: depreciation_percent} mapping (DB-driven in production)
        adjustments: Any approved adjustments (positive or negative)

    Returns:
        {
            "invoice_value": 900000,
            "vehicle_age_years": 3,
            "depreciation_percent": 30.0,
            "depreciation_amount": 270000,
            "adjustments": 0,
            "idv": 630000
        }
    """
    table = depreciation_table or DEFAULT_DEPRECIATION_TABLE

    if vehicle_age_years > max(table.keys()):
        dep_percent = max(table.values())
    else:
        dep_percent = table.get(vehicle_age_years, table.get(max(k for k in table if k <= vehicle_age_years), 0))

    depreciation_amount = invoice_value * (dep_percent / 100.0)
    idv = invoice_value - depreciation_amount + adjustments

    idv = max(idv, 0)

    return {
        "invoice_value": invoice_value,
        "vehicle_age_years": vehicle_age_years,
        "depreciation_percent": dep_percent,
        "depreciation_amount": round(depreciation_amount, 2),
        "adjustments": adjustments,
        "idv": round(idv, 2),
    }
