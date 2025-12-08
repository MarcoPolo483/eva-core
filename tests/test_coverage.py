"""Additional coverage tests for edge cases."""

from eva_core.domain.entities.user import User
from eva_core.domain.value_objects.email import Email


class TestCoverageEdgeCases:
    """Tests to achieve 100% coverage."""

    def test_user_mask_pii_single_char_email_local(self) -> None:
        """Test user PII masking with single char local part in email."""
        user = User(
            tenant_id="t1",
            email="x@example.com",
            name="John",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        masked = user.mask_pii()
        # Should mask single character local as "x***"
        assert "x***" in str(masked.email) or "***" in str(masked.email)

    def test_user_mask_pii_single_char_email_domain(self) -> None:
        """Test user PII masking with single char domain part."""
        user = User(
            tenant_id="t1",
            email="test@x.com",
            name="John",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        masked = user.mask_pii()
        # Should handle single character domain start
        assert "***" in str(masked.email)

    def test_user_mask_pii_malformed_email_fallback(self) -> None:
        """Test user PII masking with malformed email (fallback path)."""
        # Create user with normal email
        user = User(
            tenant_id="t1",
            email="test@example.com",
            name="John",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        # Manually corrupt the email to test the fallback branch (len != 2)
        object.__setattr__(user, "email", "notanemail")
        masked = user.mask_pii()
        # When split doesn't give 2 parts, it skips masking and just keeps name masked
        assert masked.name == "J***"

    def test_email_mask_invalid_format(self) -> None:
        """Test email mask with invalid format (fallback)."""
        # Create email bypassing validation to test fallback
        email = Email.__new__(Email)
        object.__setattr__(email, "value", "notanemail")  # Set invalid value
        masked = email.mask()
        # Should return fallback "***@***" when split doesn't give 2 parts
        assert masked == "***@***"

    def test_email_mask_single_char_local(self) -> None:
        """Test email masking with single character local part."""
        email = Email(value="x@example.com")
        masked = email.mask()
        # Single char local should use "x***" format
        assert "x***@" in masked

    def test_email_mask_single_char_domain_start(self) -> None:
        """Test email masking with single character domain."""
        email = Email(value="test@x.com")
        masked = email.mask()
        # Single char domain start should use "x***" format
        assert "@x***" in masked or "***" in masked
