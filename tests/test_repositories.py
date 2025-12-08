"""Tests for repository interfaces and in-memory implementations."""

import pytest

from eva_core.domain.entities.document import Document, DocumentType
from eva_core.domain.entities.query import Query
from eva_core.domain.entities.space import Space, SpaceVisibility
from eva_core.domain.entities.tenant import Tenant
from eva_core.domain.entities.user import User
from eva_core.domain.repositories.memory import (
    InMemoryDocumentRepository,
    InMemoryQueryRepository,
    InMemorySpaceRepository,
    InMemoryTenantRepository,
    InMemoryUserRepository,
)


class TestInMemoryUserRepository:
    """Tests for InMemoryUserRepository."""

    @pytest.fixture
    def repo(self) -> InMemoryUserRepository:
        """Create empty user repository."""
        return InMemoryUserRepository()

    @pytest.fixture
    def user(self) -> User:
        """Create test user."""
        return User(
            tenant_id="tenant-123",
            email="test@example.com",
            name="Test User",
            auth_provider="entra_id",
            auth_sub="sub-123",
            created_by="admin",
        )

    @pytest.mark.asyncio
    async def test_save_and_get(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test save and retrieve user."""
        saved = await repo.save(user)
        assert saved.id == user.id

        retrieved = await repo.get(user.id)
        assert retrieved is not None
        assert retrieved.id == user.id
        assert retrieved.email == "test@example.com"

    @pytest.mark.asyncio
    async def test_get_nonexistent(self, repo: InMemoryUserRepository) -> None:
        """Test get returns None for nonexistent user."""
        result = await repo.get("nonexistent-id")
        assert result is None

    @pytest.mark.asyncio
    async def test_delete(self, repo: InMemoryUserRepository, user: User) -> None:
        """Test delete user."""
        await repo.save(user)
        deleted = await repo.delete(user.id)
        assert deleted is True

        result = await repo.get(user.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(self, repo: InMemoryUserRepository) -> None:
        """Test delete returns False for nonexistent user."""
        deleted = await repo.delete("nonexistent-id")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_list(self, repo: InMemoryUserRepository, user: User) -> None:
        """Test list users with pagination."""
        await repo.save(user)
        users = await repo.list()
        assert len(users) == 1
        assert users[0].id == user.id

    @pytest.mark.asyncio
    async def test_get_by_email(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test find user by email."""
        await repo.save(user)
        found = await repo.get_by_email("test@example.com", "tenant-123")
        assert found is not None
        assert found.id == user.id

    @pytest.mark.asyncio
    async def test_get_by_email_wrong_tenant(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test email lookup respects tenant isolation."""
        await repo.save(user)
        found = await repo.get_by_email("test@example.com", "tenant-999")
        assert found is None

    @pytest.mark.asyncio
    async def test_get_by_auth_sub(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test get user by authentication subject ID."""
        await repo.save(user)
        found = await repo.get_by_auth_sub("sub-123", "entra_id")
        assert found is not None
        assert found.id == user.id

    @pytest.mark.asyncio
    async def test_get_by_auth_sub_not_found(
        self, repo: InMemoryUserRepository
    ) -> None:
        """Test get user by nonexistent auth subject."""
        result = await repo.get_by_auth_sub("nonexistent-sub", "entra_id")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_auth_sub_not_found_populated(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test get user by nonexistent auth subject in populated repository."""
        await repo.save(user)
        # Search for different auth_sub
        result = await repo.get_by_auth_sub("other-sub", "entra_id")
        assert result is None
        # Search for different provider
        result2 = await repo.get_by_auth_sub("sub-123", "other_provider")
        assert result2 is None

    @pytest.mark.asyncio
    async def test_list_by_tenant(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test list users by tenant."""
        await repo.save(user)
        # Add user in different tenant
        other = User(
            tenant_id="tenant-999",
            email="other@example.com",
            name="Other User",
            auth_provider="entra_id",
            auth_sub="sub-999",
            created_by="admin",
        )
        await repo.save(other)

        users = await repo.list_by_tenant("tenant-123")
        assert len(users) == 1
        assert users[0].id == user.id

    @pytest.mark.asyncio
    async def test_list_pagination(
        self, repo: InMemoryUserRepository, user: User
    ) -> None:
        """Test list with pagination."""
        await repo.save(user)
        users = await repo.list(skip=0, limit=10)
        assert len(users) == 1

        users_skip = await repo.list(skip=1, limit=10)
        assert len(users_skip) == 0

    @pytest.mark.asyncio
    async def test_get_by_email_not_found(
        self, repo: InMemoryUserRepository
    ) -> None:
        """Test get by email when email not found."""
        result = await repo.get_by_email("notfound@example.com", "tenant-123")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_email_loops_all_users(
        self, repo: InMemoryUserRepository
    ) -> None:
        """Test get by email searches through multiple users."""
        # Create multiple users
        for i in range(3):
            user = User(
                tenant_id="tenant-123",
                email=f"user{i}@example.com",
                name=f"User {i}",
                auth_provider="entra_id",
                auth_sub=f"sub-{i}",
                created_by="admin",
            )
            await repo.save(user)

        # Try to find nonexistent email - should loop through all
        result = await repo.get_by_email("nothere@example.com", "tenant-123")
        assert result is None

    @pytest.mark.asyncio
    async def test_list_by_tenant_with_pagination(
        self, repo: InMemoryUserRepository
    ) -> None:
        """Test list by tenant respects skip/limit."""
        # Create 3 users
        for i in range(3):
            user = User(
                tenant_id="tenant-123",
                email=f"user{i}@example.com",
                name=f"User {i}",
                auth_provider="entra_id",
                auth_sub=f"sub-{i}",
                created_by="admin",
            )
            await repo.save(user)

        # Skip 1, limit 1
        users = await repo.list_by_tenant("tenant-123", skip=1, limit=1)
        assert len(users) == 1

    @pytest.mark.asyncio
    async def test_list_empty(self, repo: InMemoryUserRepository) -> None:
        """Test list returns empty list when no users."""
        users = await repo.list()
        assert users == []


class TestInMemoryTenantRepository:
    """Tests for InMemoryTenantRepository."""

    @pytest.fixture
    def repo(self) -> InMemoryTenantRepository:
        """Create empty tenant repository."""
        return InMemoryTenantRepository()

    @pytest.fixture
    def tenant(self) -> Tenant:
        """Create test tenant."""
        return Tenant(
            name="Test Org",
            slug="test-org",
            created_by="system",
        )

    @pytest.mark.asyncio
    async def test_save_and_get(
        self, repo: InMemoryTenantRepository, tenant: Tenant
    ) -> None:
        """Test save and retrieve tenant."""
        saved = await repo.save(tenant)
        assert saved.id == tenant.id

        retrieved = await repo.get(tenant.id)
        assert retrieved is not None
        assert retrieved.slug == "test-org"

    @pytest.mark.asyncio
    async def test_get_by_slug(
        self, repo: InMemoryTenantRepository, tenant: Tenant
    ) -> None:
        """Test get tenant by slug."""
        await repo.save(tenant)
        found = await repo.get_by_slug("test-org")
        assert found is not None
        assert found.id == tenant.id

    @pytest.mark.asyncio
    async def test_get_by_slug_not_found(
        self, repo: InMemoryTenantRepository
    ) -> None:
        """Test get tenant by nonexistent slug."""
        result = await repo.get_by_slug("nonexistent-slug")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_slug_not_found_populated(
        self, repo: InMemoryTenantRepository, tenant: Tenant
    ) -> None:
        """Test get tenant by nonexistent slug in populated repository."""
        await repo.save(tenant)
        result = await repo.get_by_slug("other-slug")
        assert result is None

    @pytest.mark.asyncio
    async def test_list_active(
        self, repo: InMemoryTenantRepository, tenant: Tenant
    ) -> None:
        """Test list active tenants."""
        await repo.save(tenant)
        active = await repo.list_active()
        assert len(active) == 1
        assert active[0].id == tenant.id

    @pytest.mark.asyncio
    async def test_delete(
        self, repo: InMemoryTenantRepository, tenant: Tenant
    ) -> None:
        """Test delete tenant."""
        await repo.save(tenant)
        deleted = await repo.delete(tenant.id)
        assert deleted is True

        result = await repo.get(tenant.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(
        self, repo: InMemoryTenantRepository
    ) -> None:
        """Test delete nonexistent tenant returns False."""
        deleted = await repo.delete("nonexistent-id")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_list_active_empty(
        self, repo: InMemoryTenantRepository
    ) -> None:
        """Test list active tenants when none exist."""
        active = await repo.list_active()
        assert active == []

    @pytest.mark.asyncio
    async def test_list_active_filters_inactive(
        self, repo: InMemoryTenantRepository
    ) -> None:
        """Test list active excludes inactive tenants."""
        from eva_core.domain.entities.tenant import TenantStatus

        # Create inactive tenant
        inactive = Tenant(
            name="Inactive Corp",
            slug="inactive-corp",
            status=TenantStatus.SUSPENDED,
            created_by="admin",
        )
        await repo.save(inactive)

        active = await repo.list_active()
        assert len(active) == 0

    @pytest.mark.asyncio
    async def test_list_active_with_pagination(
        self, repo: InMemoryTenantRepository
    ) -> None:
        """Test list active respects skip/limit."""
        # Create 3 active tenants
        for i in range(3):
            tenant = Tenant(
                name=f"Tenant {i}",
                slug=f"tenant-{i}",
                created_by="admin",
            )
            await repo.save(tenant)

        # Skip 1, limit 2
        active = await repo.list_active(skip=1, limit=1)
        assert len(active) == 1

    @pytest.mark.asyncio
    async def test_list_empty(self, repo: InMemoryTenantRepository) -> None:
        """Test list returns empty list when no tenants."""
        tenants = await repo.list()
        assert tenants == []


class TestInMemorySpaceRepository:
    """Tests for InMemorySpaceRepository."""

    @pytest.fixture
    def repo(self) -> InMemorySpaceRepository:
        """Create empty space repository."""
        return InMemorySpaceRepository()

    @pytest.fixture
    def space(self) -> Space:
        """Create test space."""
        return Space(
            tenant_id="tenant-123",
            name="Test Space",
            owner_id="user-456",
            visibility=SpaceVisibility.PRIVATE,
        )

    @pytest.mark.asyncio
    async def test_save_and_get(
        self, repo: InMemorySpaceRepository, space: Space
    ) -> None:
        """Test save and retrieve space."""
        saved = await repo.save(space)
        assert saved.id == space.id

        retrieved = await repo.get(space.id)
        assert retrieved is not None
        assert retrieved.name == "Test Space"

    @pytest.mark.asyncio
    async def test_list_by_tenant(
        self, repo: InMemorySpaceRepository, space: Space
    ) -> None:
        """Test list spaces by tenant."""
        await repo.save(space)
        spaces = await repo.list_by_tenant("tenant-123")
        assert len(spaces) == 1
        assert spaces[0].id == space.id

    @pytest.mark.asyncio
    async def test_list_by_owner(
        self, repo: InMemorySpaceRepository, space: Space
    ) -> None:
        """Test list spaces by owner."""
        await repo.save(space)
        spaces = await repo.list_by_owner("user-456", "tenant-123")
        assert len(spaces) == 1
        assert spaces[0].id == space.id

    @pytest.mark.asyncio
    async def test_list_by_member(self, repo: InMemorySpaceRepository) -> None:
        """Test list spaces by member."""
        from eva_core.domain.entities.space import SpaceMember

        space = Space(
            tenant_id="tenant-123",
            name="Test Space",
            owner_id="user-456",
            members=[SpaceMember(user_id="user-789", added_by="user-456")],
        )
        await repo.save(space)

        spaces = await repo.list_by_member("user-789", "tenant-123")
        assert len(spaces) == 1
        assert spaces[0].id == space.id

    @pytest.mark.asyncio
    async def test_delete(
        self, repo: InMemorySpaceRepository, space: Space
    ) -> None:
        """Test delete space."""
        await repo.save(space)
        deleted = await repo.delete(space.id)
        assert deleted is True

        result = await repo.get(space.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(
        self, repo: InMemorySpaceRepository
    ) -> None:
        """Test delete nonexistent space returns False."""
        deleted = await repo.delete("nonexistent-id")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_list_empty(self, repo: InMemorySpaceRepository) -> None:
        """Test list returns empty list when no spaces."""
        spaces = await repo.list()
        assert spaces == []


class TestInMemoryDocumentRepository:
    """Tests for InMemoryDocumentRepository."""

    @pytest.fixture
    def repo(self) -> InMemoryDocumentRepository:
        """Create empty document repository."""
        return InMemoryDocumentRepository()

    @pytest.fixture
    def document(self) -> Document:
        """Create test document."""
        return Document(
            space_id="space-123",
            tenant_id="tenant-456",
            filename="test.pdf",
            size_bytes=1024,
            content_hash="abc123",
            blob_url="https://storage.example.com/test.pdf",
            document_type=DocumentType.POLICY,
            uploaded_by="user-789",
        )

    @pytest.mark.asyncio
    async def test_save_and_get(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test save and retrieve document."""
        saved = await repo.save(document)
        assert saved.id == document.id

        retrieved = await repo.get(document.id)
        assert retrieved is not None
        assert retrieved.filename == "test.pdf"

    @pytest.mark.asyncio
    async def test_list_by_space(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test list documents by space."""
        await repo.save(document)
        documents = await repo.list_by_space("space-123", "tenant-456")
        assert len(documents) == 1
        assert documents[0].id == document.id

    @pytest.mark.asyncio
    async def test_get_by_content_hash(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test get document by content hash."""
        await repo.save(document)
        found = await repo.get_by_content_hash("abc123", "tenant-456")
        assert found is not None
        assert found.id == document.id

    @pytest.mark.asyncio
    async def test_get_by_content_hash_not_found(
        self, repo: InMemoryDocumentRepository
    ) -> None:
        """Test get document by nonexistent content hash."""
        result = await repo.get_by_content_hash("nonexistent", "tenant-456")
        assert result is None

    @pytest.mark.asyncio
    async def test_get_by_content_hash_not_found_populated(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test get document by nonexistent content hash in populated repository."""
        await repo.save(document)
        # Search for different hash
        result = await repo.get_by_content_hash("other-hash", "tenant-456")
        assert result is None
        # Search for different tenant
        result2 = await repo.get_by_content_hash("abc123", "other-tenant")
        assert result2 is None

    @pytest.mark.asyncio
    async def test_list_pending_indexing(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test list documents pending indexing."""
        await repo.save(document)
        pending = await repo.list_pending_indexing("tenant-456")
        assert len(pending) == 1
        assert pending[0].id == document.id

    @pytest.mark.asyncio
    async def test_list_pending_indexing_with_limit(
        self, repo: InMemoryDocumentRepository
    ) -> None:
        """Test list pending indexing respects limit."""
        # Create 3 pending documents
        for i in range(3):
            doc = Document(
                tenant_id="tenant-456",
                space_id="space-789",
                filename=f"file{i}.pdf",
                content_type="application/pdf",
                content_hash=f"hash{i}",
                blob_url=f"https://blob.example.com/file{i}",
                size_bytes=1024,
                uploaded_by="user-123",
            )
            await repo.save(doc)

        # Request only 2
        pending = await repo.list_pending_indexing("tenant-456", limit=2)
        assert len(pending) == 2

    @pytest.mark.asyncio
    async def test_list_pending_indexing_empty_tenant(
        self, repo: InMemoryDocumentRepository
    ) -> None:
        """Test list pending indexing for tenant with no documents."""
        pending = await repo.list_pending_indexing("empty-tenant", limit=10)
        assert len(pending) == 0

    @pytest.mark.asyncio
    async def test_delete(
        self, repo: InMemoryDocumentRepository, document: Document
    ) -> None:
        """Test delete document."""
        await repo.save(document)
        deleted = await repo.delete(document.id)
        assert deleted is True

        result = await repo.get(document.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(
        self, repo: InMemoryDocumentRepository
    ) -> None:
        """Test delete nonexistent document returns False."""
        deleted = await repo.delete("nonexistent-id")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_list_empty(self, repo: InMemoryDocumentRepository) -> None:
        """Test list returns empty list when no documents."""
        documents = await repo.list()
        assert documents == []


class TestInMemoryQueryRepository:
    """Tests for InMemoryQueryRepository."""

    @pytest.fixture
    def repo(self) -> InMemoryQueryRepository:
        """Create empty query repository."""
        return InMemoryQueryRepository()

    @pytest.fixture
    def query(self) -> Query:
        """Create test query."""
        return Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the policy?",
            user_id="user-789",
            conversation_id="conv-abc",
        )

    @pytest.mark.asyncio
    async def test_save_and_get(
        self, repo: InMemoryQueryRepository, query: Query
    ) -> None:
        """Test save and retrieve query."""
        saved = await repo.save(query)
        assert saved.id == query.id

        retrieved = await repo.get(query.id)
        assert retrieved is not None
        assert retrieved.question == "What is the policy?"

    @pytest.mark.asyncio
    async def test_list_by_space(
        self, repo: InMemoryQueryRepository, query: Query
    ) -> None:
        """Test list queries by space."""
        await repo.save(query)
        queries = await repo.list_by_space("space-123", "tenant-456")
        assert len(queries) == 1
        assert queries[0].id == query.id

    @pytest.mark.asyncio
    async def test_list_by_user(
        self, repo: InMemoryQueryRepository, query: Query
    ) -> None:
        """Test list queries by user."""
        await repo.save(query)
        queries = await repo.list_by_user("user-789", "tenant-456")
        assert len(queries) == 1
        assert queries[0].id == query.id

    @pytest.mark.asyncio
    async def test_list_by_conversation(
        self, repo: InMemoryQueryRepository, query: Query
    ) -> None:
        """Test list queries by conversation."""
        await repo.save(query)
        queries = await repo.list_by_conversation("conv-abc", "tenant-456")
        assert len(queries) == 1
        assert queries[0].id == query.id

    @pytest.mark.asyncio
    async def test_delete(
        self, repo: InMemoryQueryRepository, query: Query
    ) -> None:
        """Test delete query."""
        await repo.save(query)
        deleted = await repo.delete(query.id)
        assert deleted is True

        result = await repo.get(query.id)
        assert result is None

    @pytest.mark.asyncio
    async def test_delete_nonexistent(
        self, repo: InMemoryQueryRepository
    ) -> None:
        """Test delete nonexistent query returns False."""
        deleted = await repo.delete("nonexistent-id")
        assert deleted is False

    @pytest.mark.asyncio
    async def test_list_empty(self, repo: InMemoryQueryRepository) -> None:
        """Test list returns empty list when no queries."""
        queries = await repo.list()
        assert queries == []
