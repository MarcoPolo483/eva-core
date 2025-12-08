"""Performance benchmarks for EVA Core repositories."""

import time

import pytest

from eva_core.domain.entities.document import Document
from eva_core.domain.entities.query import Query
from eva_core.domain.entities.space import Space
from eva_core.domain.entities.tenant import Tenant
from eva_core.domain.entities.user import User
from eva_core.domain.repositories.memory import (
    InMemoryDocumentRepository,
    InMemoryQueryRepository,
    InMemorySpaceRepository,
    InMemoryTenantRepository,
    InMemoryUserRepository,
)


@pytest.fixture
def user() -> User:
    """Create a test user."""
    return User(
        tenant_id="tenant-123",
        email="test@example.com",
        name="Test User",
        auth_provider="entra_id",
        auth_sub="sub-123",
        created_by="admin",
    )


@pytest.fixture
def tenant() -> Tenant:
    """Create a test tenant."""
    return Tenant(name="Test Org", slug="test-org", created_by="admin")


@pytest.fixture
def space() -> Space:
    """Create a test space."""
    return Space(
        tenant_id="tenant-123", name="Test Space", owner_id="user-456"
    )


@pytest.fixture
def document() -> Document:
    """Create a test document."""
    return Document(
        tenant_id="tenant-456",
        space_id="space-789",
        filename="test.pdf",
        content_type="application/pdf",
        content_hash="abc123",
        blob_url="https://example.com/test.pdf",
        size_bytes=1024,
        uploaded_by="user-123",
    )


@pytest.fixture
def query() -> Query:
    """Create a test query."""
    return Query(
        tenant_id="tenant-456",
        space_id="space-789",
        user_id="user-123",
        query_text="What is the meaning of life?",
        conversation_id="conv-abc",
    )


class TestUserRepositoryPerformance:
    """Performance tests for UserRepository."""

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_user_save_performance(self, user: User) -> None:
        """Test user save operation performance."""
        repo = InMemoryUserRepository()
        
        start = time.perf_counter()
        await repo.save(user)
        elapsed = time.perf_counter() - start
        
        # Should complete in under 1ms
        assert elapsed < 0.001, f"Save took {elapsed*1000:.2f}ms"

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_user_get_performance(self, user: User) -> None:
        """Test user retrieval by ID performance."""
        repo = InMemoryUserRepository()
        await repo.save(user)

        start = time.perf_counter()
        result = await repo.get(user.id)
        elapsed = time.perf_counter() - start
        
        assert result is not None
        assert elapsed < 0.001, f"Get took {elapsed*1000:.2f}ms"

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_user_list_by_tenant_performance(self, user: User) -> None:
        """Test user list by tenant performance with 100 users."""
        repo = InMemoryUserRepository()
        # Create 100 users
        for i in range(100):
            test_user = User(
                tenant_id="tenant-123",
                email=f"user{i}@example.com",
                name=f"User {i}",
                auth_provider="entra_id",
                auth_sub=f"sub-{i}",
                created_by="admin",
            )
            await repo.save(test_user)

        start = time.perf_counter()
        result = await repo.list_by_tenant("tenant-123", skip=0, limit=10)
        elapsed = time.perf_counter() - start
        
        assert len(result) == 10
        # Should filter 100 users and return 10 in under 5ms
        assert elapsed < 0.005, f"List took {elapsed*1000:.2f}ms"


class TestTenantRepositoryPerformance:
    """Performance tests for TenantRepository."""

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_tenant_save_performance(self, tenant: Tenant) -> None:
        """Test tenant save operation performance."""
        repo = InMemoryTenantRepository()

        start = time.perf_counter()
        await repo.save(tenant)
        elapsed = time.perf_counter() - start
        
        assert elapsed < 0.001, f"Save took {elapsed*1000:.2f}ms"

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_tenant_get_by_slug_performance(self, tenant: Tenant) -> None:
        """Test tenant query by slug performance."""
        repo = InMemoryTenantRepository()
        await repo.save(tenant)

        start = time.perf_counter()
        result = await repo.get_by_slug(tenant.slug)
        elapsed = time.perf_counter() - start
        
        assert result is not None
        assert elapsed < 0.001, f"Get by slug took {elapsed*1000:.2f}ms"


class TestSpaceRepositoryPerformance:
    """Performance tests for SpaceRepository."""

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_space_list_by_tenant_performance(self) -> None:
        """Test space list by tenant performance with 50 spaces."""
        repo = InMemorySpaceRepository()
        # Create 50 spaces
        for i in range(50):
            test_space = Space(
                tenant_id="tenant-123",
                name=f"Space {i}",
                owner_id="user-456",
            )
            await repo.save(test_space)

        start = time.perf_counter()
        result = await repo.list_by_tenant("tenant-123", skip=0, limit=10)
        elapsed = time.perf_counter() - start
        
        assert len(result) == 10
        assert elapsed < 0.005, f"List took {elapsed*1000:.2f}ms"


class TestDocumentRepositoryPerformance:
    """Performance tests for DocumentRepository."""

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_document_list_by_space_performance(self) -> None:
        """Test document list by space performance with 100 documents."""
        repo = InMemoryDocumentRepository()
        # Create 100 documents
        for i in range(100):
            test_doc = Document(
                tenant_id="tenant-456",
                space_id="space-789",
                filename=f"doc{i}.pdf",
                content_type="application/pdf",
                content_hash=f"hash{i}",
                blob_url=f"https://example.com/doc{i}.pdf",
                size_bytes=1024,
                uploaded_by="user-123",
            )
            await repo.save(test_doc)

        start = time.perf_counter()
        result = await repo.list_by_space("space-789", "tenant-456", skip=0, limit=10)
        elapsed = time.perf_counter() - start
        
        assert len(result) == 10
        assert elapsed < 0.005, f"List took {elapsed*1000:.2f}ms"


class TestQueryRepositoryPerformance:
    """Performance tests for QueryRepository."""

    @pytest.mark.benchmark
    @pytest.mark.asyncio
    async def test_query_list_by_conversation_performance(self) -> None:
        """Test query list by conversation performance with 50 queries."""
        repo = InMemoryQueryRepository()
        # Create 50 queries
        for i in range(50):
            test_query = Query(
                tenant_id="tenant-456",
                space_id="space-789",
                user_id="user-123",
                question=f"Question {i}?",
                conversation_id="conv-abc",
            )
            await repo.save(test_query)

        start = time.perf_counter()
        result = await repo.list_by_conversation("conv-abc", "tenant-456", skip=0, limit=10)
        elapsed = time.perf_counter() - start
        
        assert len(result) == 10
        assert elapsed < 0.005, f"List took {elapsed*1000:.2f}ms"
