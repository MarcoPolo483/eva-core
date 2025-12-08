"""Tenant repository interface."""

from abc import abstractmethod

from eva_core.domain.entities.tenant import Tenant
from eva_core.domain.repositories.base import Repository


class TenantRepository(Repository[Tenant]):
    """Repository for Tenant aggregate root.

    Extends base repository with tenant-specific query methods.
    """

    @abstractmethod
    async def get_by_slug(self, slug: str) -> Tenant | None:
        """Find tenant by URL-safe slug.

        Args:
            slug: Tenant slug (e.g., "example-org").

        Returns:
            Tenant if found, None otherwise.
        """
        ...

    @abstractmethod
    async def list_active(self, skip: int = 0, limit: int = 100) -> list[Tenant]:
        """List active tenants with pagination.

        Args:
            skip: Number of tenants to skip.
            limit: Maximum number of tenants to return.

        Returns:
            List of active tenants.
        """
        ...
