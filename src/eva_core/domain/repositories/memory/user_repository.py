"""In-memory user repository for testing."""

from __future__ import annotations

import builtins

from eva_core.domain.entities.user import User
from eva_core.domain.repositories.user_repository import UserRepository


class InMemoryUserRepository(UserRepository):
    """In-memory implementation of UserRepository for testing.

    Stores users in a dictionary keyed by user ID.
    """

    def __init__(self) -> None:
        """Initialize empty user store."""
        self._users: dict[str, User] = {}

    async def get(self, id: str) -> User | None:
        """Retrieve user by ID."""
        return self._users.get(id)

    async def list(self, skip: int = 0, limit: int = 100) -> builtins.list[User]:
        """List users with pagination."""
        users = [u for u in self._users.values()]  # noqa: C416
        return users[skip : skip + limit]

    async def save(self, entity: User) -> User:
        """Save user."""
        self._users[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        """Delete user by ID."""
        if id in self._users:
            del self._users[id]
            return True
        return False

    async def get_by_email(self, email: str, tenant_id: str) -> User | None:
        """Find user by email within tenant."""
        for user in self._users.values():
            if user.email == email and user.tenant_id == tenant_id:
                return user
        return None

    async def get_by_auth_sub(self, auth_sub: str, auth_provider: str) -> User | None:
        """Find user by authentication subject ID."""
        for user in self._users.values():
            if user.auth_sub == auth_sub and user.auth_provider == auth_provider:
                return user
        return None

    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[User]:
        """List users in tenant with pagination."""
        users = [u for u in self._users.values() if u.tenant_id == tenant_id]
        return users[skip : skip + limit]
