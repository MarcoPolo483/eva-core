"""Email value object with validation and PII masking.

Example:
    >>> from eva_core.domain.value_objects.email import Email
    >>> email = Email(value="john.doe@canada.ca")
    >>> email.mask()
    'j***e@c*****a'
"""

from pydantic import BaseModel, EmailStr


class Email(BaseModel):
    """Email value object with validation.

    Attributes:
        value: Email address (validated by Pydantic EmailStr).
    """

    value: EmailStr

    def mask(self) -> str:
        """Mask email for logging: john.doe@example.com → j***e@e*****e.com.

        Returns:
            Masked email string with first and last characters visible.

        Example:
            >>> Email(value="john.doe@canada.ca").mask()
            'j***e@c*****a'
        """
        parts = self.value.split("@")
        if len(parts) != 2:
            return "***@***"

        local = parts[0]
        domain = parts[1]

        # Mask local part: first + *** + last
        masked_local = f"{local[0]}***{local[-1]}" if len(local) > 1 else f"{local}***"

        # Mask domain: first + ***** + last
        masked_domain = f"{domain[0]}*****{domain[-1]}" if len(domain) > 1 else f"{domain}***"

        return f"{masked_local}@{masked_domain}"
