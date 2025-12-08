"""Space repository interface."""

from abc import abstractmethod

from eva_core.domain.entities.space import Space
from eva_core.domain.repositories.base import Repository


class SpaceRepository(Repository[Space]):
    """Repository for Space aggregate root.

    Extends base repository with space-specific query methods.
    """

    @abstractmethod
    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        """List spaces in tenant with pagination.

        Args:
            tenant_id: Tenant ID.
            skip: Number of spaces to skip.
            limit: Maximum number of spaces to return.

        Returns:
            List of spaces in tenant.
        """
        ...

    @abstractmethod
    async def list_by_owner(
        self, owner_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        """List spaces owned by user.

        Args:
            owner_id: Owner user ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of spaces to skip.
            limit: Maximum number of spaces to return.

        Returns:
            List of spaces owned by user.
        """
        ...

    @abstractmethod
    async def list_by_member(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        """List spaces where user is a member.

        Args:
            user_id: User ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of spaces to skip.
            limit: Maximum number of spaces to return.

        Returns:
            List of spaces where user is member.
        """
        ...
