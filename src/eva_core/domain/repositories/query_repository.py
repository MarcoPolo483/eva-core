"""Query repository interface."""

from abc import abstractmethod

from eva_core.domain.entities.query import Query
from eva_core.domain.repositories.base import Repository


class QueryRepository(Repository[Query]):
    """Repository for Query entity.

    Extends base repository with query-specific query methods.
    """

    @abstractmethod
    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        """List queries in space with pagination.

        Args:
            space_id: Space ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of queries to skip.
            limit: Maximum number of queries to return.

        Returns:
            List of queries in space.
        """
        ...

    @abstractmethod
    async def list_by_user(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        """List queries by user with pagination.

        Args:
            user_id: User ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of queries to skip.
            limit: Maximum number of queries to return.

        Returns:
            List of queries by user.
        """
        ...

    @abstractmethod
    async def list_by_conversation(
        self, conversation_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        """List queries in conversation with pagination.

        Args:
            conversation_id: Conversation ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of queries to skip.
            limit: Maximum number of queries to return.

        Returns:
            List of queries in conversation.
        """
        ...
