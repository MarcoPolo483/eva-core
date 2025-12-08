"""User repository interface."""

from abc import abstractmethod

from eva_core.domain.entities.user import User
from eva_core.domain.repositories.base import Repository


class UserRepository(Repository[User]):
    """Repository for User aggregate root.

    Extends base repository with user-specific query methods.
    """

    @abstractmethod
    async def get_by_email(self, email: str, tenant_id: str) -> User | None:
        """Find user by email within tenant.

        Args:
            email: User email address.
            tenant_id: Tenant ID for isolation.

        Returns:
            User if found, None otherwise.
        """
        ...

    @abstractmethod
    async def get_by_auth_sub(self, auth_sub: str, auth_provider: str) -> User | None:
        """Find user by authentication subject ID.

        Args:
            auth_sub: Authentication provider subject ID.
            auth_provider: Authentication provider name.

        Returns:
            User if found, None otherwise.
        """
        ...

    @abstractmethod
    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[User]:
        """List users in tenant with pagination.

        Args:
            tenant_id: Tenant ID.
            skip: Number of users to skip.
            limit: Maximum number of users to return.

        Returns:
            List of users in tenant.
        """
        ...
