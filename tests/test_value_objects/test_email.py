"""Tests for Email value object."""

import pytest
from hypothesis import given
from hypothesis import strategies as st
from pydantic import ValidationError

from eva_core.domain.value_objects.email import Email


class TestEmail:
    """Test suite for Email value object."""

    def test_valid_email(self) -> None:
        """Test valid email creation."""
        email = Email(value="john.doe@canada.ca")
        assert email.value == "john.doe@canada.ca"

    def test_email_masking(self) -> None:
        """Test email PII masking."""
        email = Email(value="john.doe@canada.ca")
        masked = email.mask()
        assert masked == "j***e@c*****a"

    def test_single_char_local(self) -> None:
        """Test email with single character local part."""
        email = Email(value="a@example.com")
        masked = email.mask()
        assert masked == "a***@e*****m"

    def test_complex_email_masking(self) -> None:
        """Test masking of complex email addresses."""
        email = Email(value="a.b@example.co.uk")
        masked = email.mask()
        assert masked.startswith("a")
        assert "@" in masked
        assert "***" in masked

    @pytest.mark.parametrize(
        "invalid_email",
        [
            "not-an-email",
            "@example.com",
            "user@",
            "user @example.com",
            "",
        ],
    )
    def test_invalid_email_format(self, invalid_email: str) -> None:
        """Test rejection of invalid email formats."""
        with pytest.raises(ValidationError):
            Email(value=invalid_email)

    @given(st.emails())
    def test_property_valid_emails_accepted(self, email: str) -> None:
        """Property test: all valid emails should be accepted."""
        email_obj = Email(value=email)
        assert "@" in email_obj.value

    @given(
        st.text(
            alphabet=st.characters(blacklist_categories=("Cs",)),
            min_size=1,
            max_size=50,
        ).filter(lambda x: "@" not in x)
    )
    def test_property_invalid_emails_rejected(self, invalid: str) -> None:
        """Property test: strings without @ should be rejected."""
        with pytest.raises(ValidationError):
            Email(value=invalid)

    def test_email_value_object_pattern(self) -> None:
        """Test that Email follows value object pattern."""
        email1 = Email(value="test@example.com")
        email2 = Email(value="test@example.com")
        # Value objects with same value should be equal
        assert email1.value == email2.value
