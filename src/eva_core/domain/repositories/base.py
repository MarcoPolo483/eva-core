"""Base repository interface.

Defines the contract for all repositories in the domain layer.
Repositories abstract persistence concerns from domain logic.
"""

from abc import ABC, abstractmethod
from typing import Generic, TypeVar

from pydantic import BaseModel

# Generic type for entities
T = TypeVar("T", bound=BaseModel)


class Repository(ABC, Generic[T]):
    """Abstract base repository for domain entities.

    Provides standard CRUD operations that all repositories must implement.
    Uses generic type T to ensure type safety across implementations.

    Type Parameters:
        T: The entity type this repository manages (must be Pydantic BaseModel).

    Example:
        >>> class UserRepository(Repository[User]):
        ...     async def get(self, id: str) -> User | None:
        ...         # Implementation
        ...         pass
    """

    @abstractmethod
    async def get(self, id: str) -> T | None:
        """Retrieve entity by ID.

        Args:
            id: Entity identifier.

        Returns:
            Entity if found, None otherwise.
        """
        ...

    @abstractmethod
    async def list(self, skip: int = 0, limit: int = 100) -> list[T]:
        """List entities with pagination.

        Args:
            skip: Number of entities to skip.
            limit: Maximum number of entities to return.

        Returns:
            List of entities.
        """
        ...

    @abstractmethod
    async def save(self, entity: T) -> T:
        """Save (create or update) entity.

        Args:
            entity: Entity to save.

        Returns:
            Saved entity (may include generated fields).
        """
        ...

    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete entity by ID.

        Args:
            id: Entity identifier.

        Returns:
            True if entity was deleted, False if not found.
        """
        ...
