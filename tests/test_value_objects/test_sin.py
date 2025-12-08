"""Tests for SIN value object."""

import pytest
from hypothesis import given
from hypothesis import strategies as st
from pydantic import ValidationError

from eva_core.domain.value_objects.sin import SIN


class TestSIN:
    """Test suite for SIN value object."""

    def test_valid_sin_unformatted(self) -> None:
        """Test valid SIN creation (unformatted)."""
        # Valid SIN with Luhn checksum: 046454286
        sin = SIN(value="046454286")
        assert sin.value == "046-454-286"

    def test_valid_sin_formatted(self) -> None:
        """Test valid SIN creation (already formatted)."""
        sin = SIN(value="046-454-286")
        assert sin.value == "046-454-286"

    def test_sin_masking(self) -> None:
        """Test SIN PII masking (Protected B)."""
        sin = SIN(value="046454286")
        masked = sin.mask()
        assert masked == "***-***-286"

    def test_sin_with_spaces(self) -> None:
        """Test SIN with spaces."""
        sin = SIN(value="046 454 286")
        assert sin.value == "046-454-286"

    @pytest.mark.parametrize(
        "valid_sin",
        [
            "046454286",  # Valid Luhn checksum
            "193456787",  # Valid Luhn checksum
            "130692544",  # Valid Luhn checksum
        ],
    )
    def test_valid_luhn_checksums(self, valid_sin: str) -> None:
        """Test acceptance of SINs with valid Luhn checksums."""
        sin = SIN(value=valid_sin)
        assert len(sin.value.replace("-", "")) == 9

    @pytest.mark.parametrize(
        "invalid_sin,expected_error",
        [
            ("12345678", "9 digits"),  # 8 digits
            ("1234567890", "9 digits"),  # 10 digits
            ("", "9 digits"),  # Empty
            ("046454287", "checksum"),  # Invalid checksum (last digit changed)
            ("123456789", "checksum"),  # Invalid checksum
        ],
    )
    def test_invalid_sin_format(self, invalid_sin: str, expected_error: str) -> None:
        """Test rejection of invalid SIN formats."""
        with pytest.raises(ValidationError, match=expected_error):
            SIN(value=invalid_sin)

    def test_luhn_checksum_algorithm(self) -> None:
        """Test Luhn checksum calculation explicitly."""
        # 046454286 breakdown:
        # Positions: 0 1 2 3 4 5 6 7 8
        # Digits:    0 4 6 4 5 4 2 8 6
        # Even pos (0,2,4,6,8): 0 + 6 + 5 + 2 + 6 = 19
        # Odd pos doubled: (4*2=8) + (4*2=8) + (4*2=8) + (8*2=16->1+6=7) = 31
        # Total: 19 + 31 = 50 (divisible by 10) ✓
        sin = SIN(value="046454286")
        assert sin.value == "046-454-286"

    @given(
        st.text(
            alphabet=st.characters(whitelist_categories=("Nd",)),
            min_size=1,
            max_size=50,
        ).filter(lambda x: len(x) != 9)
    )
    def test_property_non_9_digits_rejected(self, digits: str) -> None:
        """Property test: non-9-digit strings should be rejected."""
        with pytest.raises(ValidationError):
            SIN(value=digits)

    def test_sin_value_object_pattern(self) -> None:
        """Test that SIN follows value object pattern."""
        sin1 = SIN(value="046454286")
        sin2 = SIN(value="046-454-286")
        # Same SIN, different input format, should normalize to same value
        assert sin1.value == sin2.value
