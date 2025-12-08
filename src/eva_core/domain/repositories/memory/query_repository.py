"""In-memory query repository for testing."""

from __future__ import annotations

import builtins

from eva_core.domain.entities.query import Query
from eva_core.domain.repositories.query_repository import QueryRepository


class InMemoryQueryRepository(QueryRepository):
    """In-memory implementation of QueryRepository for testing.

    Stores queries in a dictionary keyed by query ID.
    """

    def __init__(self) -> None:
        """Initialize empty query store."""
        self._queries: dict[str, Query] = {}

    async def get(self, id: str) -> Query | None:
        """Retrieve query by ID."""
        return self._queries.get(id)

    async def list(self, skip: int = 0, limit: int = 100) -> builtins.list[Query]:
        """List queries with pagination."""
        queries = [q for q in self._queries.values()]  # noqa: C416
        return queries[skip : skip + limit]

    async def save(self, entity: Query) -> Query:
        """Save query."""
        self._queries[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        """Delete query by ID."""
        if id in self._queries:
            del self._queries[id]
            return True
        return False

    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Query]:
        """List queries in space with pagination."""
        queries = [
            q
            for q in self._queries.values()
            if q.space_id == space_id and q.tenant_id == tenant_id
        ]
        return queries[skip : skip + limit]

    async def list_by_user(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Query]:
        """List queries by user with pagination."""
        queries = [
            q
            for q in self._queries.values()
            if q.user_id == user_id and q.tenant_id == tenant_id
        ]
        return queries[skip : skip + limit]

    async def list_by_conversation(
        self, conversation_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Query]:
        """List queries in conversation with pagination."""
        queries = [
            q
            for q in self._queries.values()
            if q.conversation_id == conversation_id and q.tenant_id == tenant_id
        ]
        return queries[skip : skip + limit]
