"""Canadian phone number value object with validation and PII masking.

Example:
    >>> from eva_core.domain.value_objects.phone_number import PhoneNumber
    >>> phone = PhoneNumber(value="6135551234")
    >>> phone.value
    '(613) 555-1234'
    >>> phone.mask()
    '(***) ***-1234'
"""

import re

from pydantic import BaseModel, field_validator


class PhoneNumber(BaseModel):
    """Canadian phone number value object.

    Validates 10-digit Canadian phone numbers and formats them consistently.

    Attributes:
        value: Phone number in format (xxx) xxx-xxxx.
    """

    value: str

    @field_validator("value")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate Canadian phone number format.

        Args:
            v: Phone number string (can include formatting).

        Returns:
            Formatted phone number: (xxx) xxx-xxxx.

        Raises:
            ValueError: If phone number is not 10 digits.

        Example:
            >>> PhoneNumber(value="6135551234").value
            '(613) 555-1234'
        """
        # Remove all non-digit characters
        digits = re.sub(r"\D", "", v)

        # Must be exactly 10 digits (Canadian format)
        if len(digits) != 10:
            raise ValueError("Phone number must be 10 digits")

        # Format: (xxx) xxx-xxxx
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"

    def mask(self) -> str:
        """Mask phone for logging: (613) 555-1234 → (***) ***-1234.

        Returns:
            Masked phone string with last 4 digits visible.

        Example:
            >>> PhoneNumber(value="6135551234").mask()
            '(***) ***-1234'
        """
        return f"(***) ***{self.value[-5:]}"
