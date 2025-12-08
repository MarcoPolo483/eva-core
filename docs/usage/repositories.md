# Repositories

The Repository pattern provides abstract interfaces for data access.

## Overview

EVA Core defines repository interfaces for each entity type. You implement these interfaces with your chosen persistence layer (PostgreSQL, MongoDB, etc.).

## Base Repository

All repositories extend `Repository[T]`:

```python
from eva_core.domain.repositories.base import Repository
from eva_core.domain.entities.user import User

class MyUserRepository(Repository[User]):
    async def get(self, id: str) -> User | None:
        # Your implementation
        pass
```

## Repository Interfaces

### UserRepository

```python
from eva_core.domain.repositories.user_repository import UserRepository

class PostgresUserRepository(UserRepository):
    async def get_by_email(self, email: str, tenant_id: str) -> User | None:
        # Query database
        pass
    
    async def get_by_auth_sub(self, auth_sub: str, auth_provider: str) -> User | None:
        # Query by auth subject
        pass
    
    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[User]:
        # List with pagination
        pass
```

### TenantRepository

```python
from eva_core.domain.repositories.tenant_repository import TenantRepository

class PostgresTenantRepository(TenantRepository):
    async def get_by_slug(self, slug: str) -> Tenant | None:
        # Find by URL slug
        pass
    
    async def list_active(
        self, skip: int = 0, limit: int = 100
    ) -> list[Tenant]:
        # List active tenants
        pass
```

### SpaceRepository

```python
from eva_core.domain.repositories.space_repository import SpaceRepository

class PostgresSpaceRepository(SpaceRepository):
    async def list_by_tenant(
        self, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        pass
    
    async def list_by_owner(
        self, owner_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        pass
    
    async def list_by_member(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Space]:
        pass
```

### DocumentRepository

```python
from eva_core.domain.repositories.document_repository import DocumentRepository

class PostgresDocumentRepository(DocumentRepository):
    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Document]:
        pass
    
    async def get_by_content_hash(
        self, content_hash: str, tenant_id: str
    ) -> Document | None:
        # Deduplication check
        pass
    
    async def list_pending_indexing(
        self, tenant_id: str, limit: int = 100
    ) -> list[Document]:
        # Find unindexed documents
        pass
```

### QueryRepository

```python
from eva_core.domain.repositories.query_repository import QueryRepository

class PostgresQueryRepository(QueryRepository):
    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        pass
    
    async def list_by_user(
        self, user_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        pass
    
    async def list_by_conversation(
        self, conversation_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Query]:
        pass
```

## In-Memory Implementations

EVA Core provides in-memory implementations for testing:

```python
from eva_core.domain.repositories.memory import (
    InMemoryUserRepository,
    InMemoryTenantRepository,
    InMemorySpaceRepository,
    InMemoryDocumentRepository,
    InMemoryQueryRepository,
)

# Use in tests
async def test_user_creation():
    repo = InMemoryUserRepository()
    
    user = User(...)
    await repo.save(user)
    
    retrieved = await repo.get(user.id)
    assert retrieved.email == user.email
```

## Usage Patterns

### CRUD Operations

```python
# Create
user = User(...)
await repo.save(user)

# Read
user = await repo.get(user_id)

# Update
user.name = "New Name"
await repo.save(user)

# Delete
deleted = await repo.delete(user_id)
```

### Querying

```python
# By unique field
user = await user_repo.get_by_email("alice@example.com", tenant_id)

# List with pagination
users = await user_repo.list_by_tenant(tenant_id, skip=0, limit=10)

# Custom queries
pending = await doc_repo.list_pending_indexing(tenant_id)
```

### Tenant Isolation

Always filter by `tenant_id`:

```python
# Correct
spaces = await space_repo.list_by_tenant(tenant_id)

# Also correct - enforces tenant isolation
user = await user_repo.get_by_email(email, tenant_id)
```

## Implementing Your Repository

```python
from sqlalchemy.ext.asyncio import AsyncSession
from eva_core.domain.repositories.user_repository import UserRepository
from eva_core.domain.entities.user import User

class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def get(self, id: str) -> User | None:
        result = await self.session.execute(
            select(UserModel).where(UserModel.id == id)
        )
        model = result.scalar_one_or_none()
        return model.to_entity() if model else None
    
    async def save(self, entity: User) -> User:
        model = UserModel.from_entity(entity)
        self.session.add(model)
        await self.session.commit()
        return entity
    
    # ... implement other methods
```

## See Also

- [Entities](entities.md)
- [API Reference](../api/repositories.md)
- [Testing](../development/testing.md)
