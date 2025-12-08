"""Tenant entity (aggregate root) - represents an organization or department.

Example:
    >>> from eva_core.domain.entities.tenant import Tenant, TenantQuotas
    >>> tenant = Tenant(
    ...     name="Department of Example",
    ...     slug="dept-of-example",
    ...     created_by="admin-123"
    ... )
"""

import uuid
from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class TenantStatus(str, Enum):
    """Tenant status."""

    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"


class TenantQuotas(BaseModel):
    """Resource limits per tenant.

    Attributes:
        max_users: Maximum number of users.
        max_spaces: Maximum number of spaces.
        max_documents_per_space: Maximum documents per space.
        max_storage_gb: Maximum storage in GB.
        max_queries_per_month: Maximum queries per month.
    """

    max_users: int = 100
    max_spaces: int = 50
    max_documents_per_space: int = 10000
    max_storage_gb: int = 100
    max_queries_per_month: int = 10000


class Tenant(BaseModel):
    """Tenant entity (aggregate root for multi-tenancy).

    Represents an organization or department (multi-tenancy boundary).

    Attributes:
        id: Unique identifier.
        name: Organization name (e.g., "Department of Example").
        slug: URL-safe identifier (e.g., "dept-of-example").
        status: Tenant status (active, suspended, archived).
        quotas: Resource limits.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
        created_by: User ID (admin who created tenant).
    """

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # Profile
    name: str = Field(min_length=1, max_length=200)
    slug: str = Field(pattern=r"^[a-z0-9-]+$")  # URL-safe identifier
    status: TenantStatus = TenantStatus.ACTIVE

    # Configuration
    quotas: TenantQuotas = Field(default_factory=TenantQuotas)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Audit
    created_by: str  # User ID (admin who created tenant)

    def is_quota_exceeded(self, resource: str, current_count: int) -> bool:
        """Check if resource quota is exceeded.

        Args:
            resource: Resource name (users, spaces, documents_per_space,
                storage_gb, queries_per_month).
            current_count: Current count of the resource.

        Returns:
            True if quota is exceeded, False otherwise.

        Example:
            >>> tenant = Tenant(name="Dept", slug="dept", created_by="admin")
            >>> tenant.is_quota_exceeded("users", 150)
            True
            >>> tenant.is_quota_exceeded("users", 50)
            False
        """
        quotas_dict = self.quotas.model_dump()
        max_allowed = int(quotas_dict.get(f"max_{resource}", float("inf")))
        return bool(current_count >= max_allowed)
