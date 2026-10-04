"""Masking helpers. Consent and the audit log are added with the profile work."""

import re

# Aadhaar: 12 digits, optionally grouped 4-4-4. Keep the last 4.
_AADHAAR = re.compile(r"\b(\d{4})[ -]?(\d{4})[ -]?(\d{4})\b")
# PAN: 5 letters, 4 digits, 1 letter. Keep the last 4 characters.
_PAN = re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE)
# Indian mobile numbers: optional +91, 10 digits starting 6-9. Keep the last 2.
_PHONE = re.compile(r"(?<!\d)(?:\+?91[ -]?)?([6-9]\d{7})(\d{2})(?!\d)")


def mask(text: str) -> str:
    """Mask Aadhaar, PAN and phone numbers in free text."""
    text = _AADHAAR.sub(lambda m: f"XXXX-XXXX-{m.group(3)}", text)
    text = _PAN.sub(lambda m: "XXXXXX" + m.group(0)[-4:].upper(), text)
    text = _PHONE.sub(lambda m: "XXXXXXXX" + m.group(2), text)
    return text
