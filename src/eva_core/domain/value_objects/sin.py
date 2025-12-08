"""Canadian Social Insurance Number (SIN) value object with validation and PII masking.

Protected B PII - must be masked in all logs and telemetry.

Example:
    >>> from eva_core.domain.value_objects.sin import SIN
    >>> sin = SIN(value="046454286")
    >>> sin.value
    '046-454-286'
    >>> sin.mask()
    '***-***-286'
"""

import re

from pydantic import BaseModel, field_validator


class SIN(BaseModel):
    """Canadian Social Insurance Number (Protected B PII).

    Validates 9-digit SINs using Luhn checksum algorithm (CRA standard).

    Attributes:
        value: SIN in format xxx-xxx-xxx.
    """

    value: str

    @field_validator("value")
    @classmethod
    def validate_sin(cls, v: str) -> str:
        """Validate SIN format (9 digits, Luhn checksum).

        Args:
            v: SIN string (can include dashes/spaces).

        Returns:
            Formatted SIN: xxx-xxx-xxx.

        Raises:
            ValueError: If SIN is not 9 digits or fails Luhn checksum.

        Example:
            >>> SIN(value="046454286").value
            '046-454-286'
        """
        # Remove all non-digit characters
        digits = re.sub(r"\D", "", v)

        # Must be exactly 9 digits
        if len(digits) != 9:
            raise ValueError("SIN must be 9 digits")

        # Luhn checksum validation (CRA algorithm)
        # Multiply every other digit by 2, sum all digits
        checksum = 0
        for i, d in enumerate(digits):
            digit = int(d)
            if i % 2 == 0:
                # Even position (0-indexed): use digit as-is
                checksum += digit
            else:
                # Odd position: multiply by 2, then sum digits of result
                doubled = digit * 2
                checksum += doubled // 10 + doubled % 10

        # Checksum must be divisible by 10
        if checksum % 10 != 0:
            raise ValueError("Invalid SIN checksum")

        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

    def mask(self) -> str:
        """Mask SIN for logging: 046-454-286 → ***-***-286.

        Returns:
            Masked SIN string with last 3 digits visible.

        Example:
            >>> SIN(value="046454286").mask()
            '***-***-286'
        """
        return f"***-***{self.value[-4:]}"
