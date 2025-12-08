"""Tests for User entity."""

import pytest
from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st
from pydantic import ValidationError

from eva_core.domain.entities.user import User, UserPreferences, UserRole, UserStatus


class TestUser:
    """Test suite for User entity."""

    def test_user_creation_minimal(self) -> None:
        """Test user creation with minimal required fields."""
        user = User(
            tenant_id="tenant-123",
            email="john.doe@canada.ca",
            name="John Doe",
            auth_provider="entra_id",
            auth_sub="sub-123",
            created_by="admin-456",
        )
        assert user.tenant_id == "tenant-123"
        assert user.email == "john.doe@canada.ca"
        assert user.role == UserRole.VIEWER  # Default
        assert user.status == UserStatus.ACTIVE  # Default

    def test_user_with_preferences(self) -> None:
        """Test user with custom preferences."""
        prefs = UserPreferences(
            locale="fr-CA", timezone="America/Montreal", results_per_page=50
        )
        user = User(
            tenant_id="t1",
            email="user@example.com",
            name="Test User",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
            preferences=prefs,
        )
        assert user.preferences.locale == "fr-CA"
        assert user.preferences.results_per_page == 50

    def test_user_roles(self) -> None:
        """Test all user role values."""
        roles = [UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN, UserRole.SYSTEM]
        for role in roles:
            user = User(
                tenant_id="t1",
                email=f"{role.value}@example.com",
                name=f"{role.value} User",
                role=role,
                auth_provider="entra_id",
                auth_sub=f"sub-{role.value}",
                created_by="admin",
            )
            assert user.role == role

    def test_can_access_space_tenant_isolation(self) -> None:
        """Test tenant isolation in space access."""
        user = User(
            tenant_id="tenant-1",
            email="user@example.com",
            name="User",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        # Different tenant - no access
        assert not user.can_access_space("owner-1", "tenant-2")
        # Same tenant - depends on role
        assert not user.can_access_space("owner-1", "tenant-1")  # VIEWER can't

    def test_can_access_space_admin_privilege(self) -> None:
        """Test admin can access all spaces in tenant."""
        admin = User(
            tenant_id="tenant-1",
            email="admin@example.com",
            name="Admin",
            role=UserRole.ADMIN,
            auth_provider="entra_id",
            auth_sub="sub-admin",
            created_by="super-admin",
        )
        # Admin in same tenant can access
        assert admin.can_access_space("owner-1", "tenant-1")
        # Admin in different tenant cannot
        assert not admin.can_access_space("owner-1", "tenant-2")

    def test_mask_pii_email(self) -> None:
        """Test email PII masking."""
        user = User(
            tenant_id="t1",
            email="john.doe@canada.ca",
            name="John Doe",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        masked = user.mask_pii()
        assert "***" in str(masked.email)
        assert str(masked.email).startswith("j")
        assert "@" in str(masked.email)
        # Original unchanged
        assert user.email == "john.doe@canada.ca"

    def test_mask_pii_name(self) -> None:
        """Test name PII masking."""
        user = User(
            tenant_id="t1",
            email="user@example.com",
            name="John Alexander Doe",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        masked = user.mask_pii()
        assert masked.name == "J*** A*** D***"
        # Original unchanged
        assert user.name == "John Alexander Doe"

    def test_user_status_values(self) -> None:
        """Test all user status values."""
        statuses = [UserStatus.ACTIVE, UserStatus.SUSPENDED, UserStatus.DELETED]
        for status in statuses:
            user = User(
                tenant_id="t1",
                email=f"{status.value}@example.com",
                name="User",
                status=status,
                auth_provider="entra_id",
                auth_sub=f"sub-{status.value}",
                created_by="admin",
            )
            assert user.status == status

    @pytest.mark.parametrize("invalid_name", ["", " " * 300])
    def test_invalid_name_length(self, invalid_name: str) -> None:
        """Test rejection of invalid name lengths."""
        with pytest.raises(ValidationError):
            User(
                tenant_id="t1",
                email="user@example.com",
                name=invalid_name,
                auth_provider="entra_id",
                auth_sub="sub-1",
                created_by="admin",
            )

    @given(st.emails())
    @settings(suppress_health_check=[HealthCheck.too_slow], max_examples=10)
    def test_property_valid_emails(self, email: str) -> None:
        """Property test: all valid emails accepted."""
        user = User(
            tenant_id="t1",
            email=email,
            name="Test User",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        assert "@" in user.email

    def test_user_has_id(self) -> None:
        """Test user gets unique ID on creation."""
        user1 = User(
            tenant_id="t1",
            email="user1@example.com",
            name="User 1",
            auth_provider="entra_id",
            auth_sub="sub-1",
            created_by="admin",
        )
        user2 = User(
            tenant_id="t1",
            email="user2@example.com",
            name="User 2",
            auth_provider="entra_id",
            auth_sub="sub-2",
            created_by="admin",
        )
        assert user1.id != user2.id
        assert len(user1.id) > 0
