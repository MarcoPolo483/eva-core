"""User entity (aggregate root) - represents a person using EVA.

Example:
    >>> from eva_core.domain.entities.user import User, UserRole
    >>> user = User(
    ...     tenant_id="tenant-123",
    ...     email="john.doe@canada.ca",
    ...     name="John Doe",
    ...     role=UserRole.ANALYST,
    ...     auth_provider="entra_id",
    ...     auth_sub="sub-123",
    ...     created_by="admin-456"
    ... )
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """User roles with increasing permissions."""

    VIEWER = "viewer"  # Read-only access
    ANALYST = "analyst"  # Can create queries, add documents
    ADMIN = "admin"  # Full control (user management, space management)
    SYSTEM = "system"  # Internal system operations


class UserStatus(str, Enum):
    """User account status."""

    ACTIVE = "active"  # Can use system
    SUSPENDED = "suspended"  # Temporarily blocked
    DELETED = "deleted"  # Soft-deleted (retain audit trail)


class UserPreferences(BaseModel):
    """User preferences (UI settings, notifications).

    Attributes:
        locale: Language (en-CA, fr-CA).
        timezone: Timezone string (e.g., America/Toronto).
        email_notifications: Email notifications enabled.
        theme: UI theme (light, dark, auto).
        results_per_page: Pagination default.
    """

    locale: str = "en-CA"
    timezone: str = "America/Toronto"
    email_notifications: bool = True
    theme: str = "auto"
    results_per_page: int = 20


class User(BaseModel):
    """User entity (aggregate root).

    Represents a person using EVA (citizen or employee).

    Attributes:
        id: Unique identifier.
        tenant_id: Organization/department ID (tenant isolation).
        email: Email address.
        name: Full name.
        role: User role (viewer, analyst, admin, system).
        status: Account status (active, suspended, deleted).
        auth_provider: Authentication provider (entra_id, b2c).
        auth_sub: Subject claim from JWT (unique per provider).
        preferences: User preferences.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
        last_login_at: Last login timestamp (optional).
        created_by: User ID who created this user.
    """

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str

    # Profile
    email: EmailStr
    name: str = Field(min_length=1, max_length=200)
    role: UserRole = UserRole.VIEWER
    status: UserStatus = UserStatus.ACTIVE

    # Authentication (references eva-auth)
    auth_provider: str = "entra_id"  # entra_id, b2c
    auth_sub: str  # Subject claim from JWT (unique per provider)

    # Preferences
    preferences: UserPreferences = Field(default_factory=UserPreferences)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: datetime | None = None

    # Audit
    created_by: str  # User ID who created this user (for admin actions)

    def can_access_space(self, space_owner_id: str, space_tenant_id: str) -> bool:
        """Check if user can access space (business logic).

        Args:
            space_owner_id: Owner ID of the space.
            space_tenant_id: Tenant ID of the space.

        Returns:
            True if user can access the space, False otherwise.

        Business Rules:
            - Tenant isolation: user must be in same tenant.
            - Admins can access all spaces in their tenant.
            - Users can only access spaces they own (checked elsewhere).
        """
        # Tenant isolation: user must be in same tenant
        if self.tenant_id != space_tenant_id:
            return False

        # Admins can access all spaces in their tenant
        if self.role == UserRole.ADMIN:
            return True

        # Users can only access spaces they own (checked elsewhere)
        return False

    def ensure_same_tenant(self, other_tenant_id: str) -> None:
        """Ensure user belongs to specified tenant.

        Raises:
            ValueError: If tenant_id doesn't match.
        """
        if self.tenant_id != other_tenant_id:
            raise ValueError(
                f"Tenant isolation violation: user tenant {self.tenant_id} "
                f"does not match {other_tenant_id}"
            )

    def mask_pii(self) -> "User":
        """Return copy with PII masked (for logging/telemetry).

        Returns:
            User instance with email and name masked.

        Example:
            >>> user = User(
            ...     tenant_id="t1",
            ...     email="john.doe@canada.ca",
            ...     name="John Doe",
            ...     auth_provider="entra_id",
            ...     auth_sub="sub-123",
            ...     created_by="admin"
            ... )
            >>> masked = user.mask_pii()
            >>> masked.email  # doctest: +ELLIPSIS
            'j***e@c*****a'
            >>> masked.name
            'J*** D***'
        """
        masked = self.model_copy(deep=True)

        # Mask email: john.doe@example.com → j***e@e*****e.com
        email_parts = str(masked.email).split("@")
        if len(email_parts) == 2:
            local = email_parts[0]
            domain = email_parts[1]
            masked_local = f"{local[0]}***{local[-1]}" if len(local) > 1 else f"{local}***"
            masked_domain = f"{domain[0]}*****{domain[-1]}" if len(domain) > 1 else f"{domain}***"
            # Assign string directly using object.__setattr__ for immutable model
            object.__setattr__(masked, "email", f"{masked_local}@{masked_domain}")

        # Mask name: John Doe → J*** D***
        name_parts = masked.name.split()
        masked.name = " ".join([f"{part[0]}***" if part else "***" for part in name_parts])

        return masked
