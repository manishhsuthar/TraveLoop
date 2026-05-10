from decimal import Decimal


CURRENCY_CODE = "INR"
CURRENCY_SYMBOL = "₹"


def format_inr(value):
    """Format a numeric amount using Indian digit grouping."""
    amount = int(round(Decimal(value or 0)))
    sign = "-" if amount < 0 else ""
    digits = str(abs(amount))

    if len(digits) <= 3:
        grouped = digits
    else:
        grouped = digits[-3:]
        prefix = digits[:-3]
        parts = []
        while len(prefix) > 2:
            parts.insert(0, prefix[-2:])
            prefix = prefix[:-2]
        if prefix:
            parts.insert(0, prefix)
        grouped = ",".join(parts + [grouped])

    return f"{sign}{CURRENCY_SYMBOL}{grouped}"
