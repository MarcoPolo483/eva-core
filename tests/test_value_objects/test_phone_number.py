"""Tests for PhoneNumber value object."""

import pytest
from hypothesis import given
from hypothesis import strategies as st
from pydantic import ValidationError

from eva_core.domain.value_objects.phone_number import PhoneNumber


class TestPhoneNumber:
    """Test suite for PhoneNumber value object."""

    def test_valid_phone_unformatted(self) -> None:
        """Test valid phone number creation (unformatted)."""
        phone = PhoneNumber(value="6135551234")
        assert phone.value == "(613) 555-1234"

    def test_valid_phone_formatted(self) -> None:
        """Test valid phone number creation (already formatted)."""
        phone = PhoneNumber(value="(613) 555-1234")
        assert phone.value == "(613) 555-1234"

    def test_phone_masking(self) -> None:
        """Test phone number PII masking."""
        phone = PhoneNumber(value="6135551234")
        masked = phone.mask()
        assert masked == "(***) ***-1234"

    def test_phone_with_spaces_dashes(self) -> None:
        """Test phone with various formatting characters."""
        phone = PhoneNumber(value="613-555-1234")
        assert phone.value == "(613) 555-1234"

        phone2 = PhoneNumber(value="613 555 1234")
        assert phone2.value == "(613) 555-1234"

    @pytest.mark.parametrize(
        "invalid_phone",
        [
            "123456789",  # 9 digits
            "12345678901",  # 11 digits
            "abcdefghij",  # Letters
            "",  # Empty
            "123",  # Too short
        ],
    )
    def test_invalid_phone_length(self, invalid_phone: str) -> None:
        """Test rejection of invalid phone lengths."""
        with pytest.raises(ValidationError, match="10 digits"):
            PhoneNumber(value=invalid_phone)

    @given(
        st.text(
            alphabet=st.characters(whitelist_categories=("Nd",)),
            min_size=10,
            max_size=10,
        )
    )
    def test_property_10_digits_accepted(self, digits: str) -> None:
        """Property test: any 10-digit string should be accepted and formatted."""
        phone = PhoneNumber(value=digits)
        assert len(phone.value.replace("(", "").replace(")", "").replace(" ", "").replace("-", "")) == 10  # noqa: E501

    @given(
        st.text(
            alphabet=st.characters(whitelist_categories=("Nd",)),
            min_size=1,
            max_size=50,
        ).filter(lambda x: len(x) != 10)
    )
    def test_property_non_10_digits_rejected(self, digits: str) -> None:
        """Property test: non-10-digit strings should be rejected."""
        with pytest.raises(ValidationError):
            PhoneNumber(value=digits)

    def test_phone_value_object_pattern(self) -> None:
        """Test that PhoneNumber follows value object pattern."""
        phone1 = PhoneNumber(value="6135551234")
        phone2 = PhoneNumber(value="(613) 555-1234")
        # Same number, different input format, should normalize to same value
        assert phone1.value == phone2.value
