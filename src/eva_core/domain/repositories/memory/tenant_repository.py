"""In-memory tenant repository for testing."""

from __future__ import annotations

import builtins

from eva_core.domain.entities.tenant import Tenant, TenantStatus
from eva_core.domain.repositories.tenant_repository import TenantRepository


class InMemoryTenantRepository(TenantRepository):
    """In-memory implementation of TenantRepository for testing.

    Stores tenants in a dictionary keyed by tenant ID.
    """

    def __init__(self) -> None:
        """Initialize empty tenant store."""
        self._tenants: dict[str, Tenant] = {}

    async def get(self, id: str) -> Tenant | None:
        """Retrieve tenant by ID."""
        return self._tenants.get(id)

    async def list(self, skip: int = 0, limit: int = 100) -> builtins.list[Tenant]:
        """List tenants with pagination."""
        tenants = [t for t in self._tenants.values()]  # noqa: C416
        return tenants[skip : skip + limit]

    async def save(self, entity: Tenant) -> Tenant:
        """Save tenant."""
        self._tenants[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        """Delete tenant by ID."""
        if id in self._tenants:
            del self._tenants[id]
            return True
        return False

    async def get_by_slug(self, slug: str) -> Tenant | None:
        """Find tenant by URL-safe slug."""
        for tenant in self._tenants.values():
            if tenant.slug == slug:
                return tenant
        return None

    async def list_active(self, skip: int = 0, limit: int = 100) -> builtins.list[Tenant]:
        """List active tenants with pagination."""
        active = [
            t for t in self._tenants.values() if t.status == TenantStatus.ACTIVE
        ]
        return active[skip : skip + limit]
