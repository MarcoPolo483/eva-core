"""In-memory space repository for testing."""

from __future__ import annotations

import builtins

from eva_core.domain.entities.space import Space
from eva_core.domain.repositories.space_repository import SpaceRepository


class InMemorySpaceRepository(SpaceRepository):
    """In-memory implementation of SpaceRepository for testing.

    Stores spaces in a dictionary keyed by space ID.
    """

    def __init__(self) -> None:
        """Initialize empty space store."""
        self._spaces: dict[str, Space] = {}

    async def get(self, id: str) -> Space | None:
        """Retrieve space by ID."""
        return self._spaces.get(id)

    async def list(self, skip: int = 0, limit: int = 100) -> builtins.list[Space]:
        """List spaces with pagination."""
        spaces = [s for s in self._spaces.values()]  # noqa: C416
        return spaces[skip : skip + limit]

    async def save(self, entity: Space) -> Space:
        """Save space."""
        self._spaces[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        """Delete space by ID."""
        if id in self._spaces:
            del self._spaces[id]
            return True
        return False

    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Space]:
        """List spaces in tenant with pagination."""
        spaces = [s for s in self._spaces.values() if s.tenant_id == tenant_id]
        return spaces[skip : skip + limit]

    async def list_by_owner(
        self, owner_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Space]:
        """List spaces owned by user."""
        spaces = [
            s
            for s in self._spaces.values()
            if s.owner_id == owner_id and s.tenant_id == tenant_id
        ]
        return spaces[skip : skip + limit]

    async def list_by_member(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Space]:
        """List spaces where user is a member."""
        spaces = [
            s
            for s in self._spaces.values()
            if s.tenant_id == tenant_id
            and any(m.user_id == user_id for m in s.members)
        ]
        return spaces[skip : skip + limit]
