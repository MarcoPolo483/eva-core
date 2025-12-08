"""Tests for remaining entities - Tenant, Space, Document, Query, Conversation."""

import pytest
from pydantic import ValidationError

from eva_core.domain.entities.conversation import Conversation, ConversationStatus
from eva_core.domain.entities.document import Document, DocumentStatus
from eva_core.domain.entities.query import Citation, Query, QueryStatus
from eva_core.domain.entities.space import Space, SpaceMember, SpaceVisibility
from eva_core.domain.entities.tenant import Tenant, TenantStatus


class TestTenant:
    """Test suite for Tenant entity."""

    def test_tenant_creation(self) -> None:
        """Test tenant creation."""
        tenant = Tenant(name="Department", slug="dept", created_by="admin")
        assert tenant.name == "Department"
        assert tenant.slug == "dept"
        assert tenant.status == TenantStatus.ACTIVE

    def test_is_quota_exceeded(self) -> None:
        """Test quota checking logic."""
        tenant = Tenant(name="Dept", slug="dept", created_by="admin")
        assert not tenant.is_quota_exceeded("users", 50)
        assert tenant.is_quota_exceeded("users", 150)

    @pytest.mark.parametrize("invalid_slug", ["Dept-1", "dept_1", "dept 1", ""])
    def test_invalid_slug_format(self, invalid_slug: str) -> None:
        """Test rejection of invalid slug formats."""
        with pytest.raises(ValidationError):
            Tenant(name="Department", slug=invalid_slug, created_by="admin")


class TestSpace:
    """Test suite for Space entity."""

    def test_space_creation(self) -> None:
        """Test space creation."""
        space = Space(tenant_id="t1", name="Research", owner_id="user1")
        assert space.name == "Research"
        assert space.owner_id == "user1"
        assert space.visibility == SpaceVisibility.PRIVATE

    def test_has_member(self) -> None:
        """Test member checking."""
        space = Space(tenant_id="t1", name="Space", owner_id="owner1")
        assert space.has_member("owner1")
        assert not space.has_member("user2")

    def test_get_member_role(self) -> None:
        """Test role retrieval."""
        member = SpaceMember(user_id="user2", role="viewer", added_by="owner1")
        space = Space(tenant_id="t1", name="Space", owner_id="owner1", members=[member])
        assert space.get_member_role("owner1") == "owner"
        assert space.get_member_role("user2") == "viewer"
        assert space.get_member_role("user3") is None

    def test_can_add_document(self) -> None:
        """Test document addition permission."""
        member_viewer = SpaceMember(user_id="viewer", role="viewer", added_by="owner")
        member_contrib = SpaceMember(user_id="contrib", role="contributor", added_by="owner")
        space = Space(
            tenant_id="t1",
            name="Space",
            owner_id="owner",
            members=[member_viewer, member_contrib],
        )
        assert space.can_add_document("owner")
        assert space.can_add_document("contrib")
        assert not space.can_add_document("viewer")

    def test_add_document_updates_stats(self) -> None:
        """Test document addition updates space statistics."""
        space = Space(tenant_id="t1", name="Space", owner_id="owner")
        initial_count = space.document_count
        initial_size = space.total_size_bytes
        space.add_document("doc1", 1024)
        assert space.document_count == initial_count + 1
        assert space.total_size_bytes == initial_size + 1024

    def test_duplicate_members_rejected(self) -> None:
        """Test duplicate members are rejected."""
        with pytest.raises(ValidationError, match="Duplicate members"):
            Space(
                tenant_id="t1",
                name="Space",
                owner_id="owner",
                members=[
                    SpaceMember(user_id="user1", added_by="owner"),
                    SpaceMember(user_id="user1", added_by="owner"),
                ],
            )


class TestDocument:
    """Test suite for Document entity."""

    def test_document_creation(self) -> None:
        """Test document creation."""
        doc = Document(
            space_id="space1",
            tenant_id="t1",
            filename="policy.pdf",
            size_bytes=1024,
            content_hash="abc123",
            blob_url="https://storage/doc1",
            uploaded_by="user1",
        )
        assert doc.filename == "policy.pdf"
        assert doc.status == DocumentStatus.PENDING

    def test_compute_content_hash(self) -> None:
        """Test content hash computation."""
        hash_val = Document.compute_content_hash(b"test content")
        assert len(hash_val) == 64  # SHA-256 hex length

    def test_is_duplicate(self) -> None:
        """Test duplicate detection."""
        doc = Document(
            space_id="s1",
            tenant_id="t1",
            filename="doc.pdf",
            size_bytes=100,
            content_hash="hash1",
            blob_url="url",
            uploaded_by="user",
        )
        assert doc.is_duplicate("hash1")
        assert not doc.is_duplicate("hash2")

    def test_mark_as_indexed(self) -> None:
        """Test marking document as indexed."""
        doc = Document(
            space_id="s1",
            tenant_id="t1",
            filename="doc.pdf",
            size_bytes=100,
            content_hash="hash",
            blob_url="url",
            uploaded_by="user",
        )
        doc.mark_as_indexed(chunk_count=5)
        assert doc.status == DocumentStatus.INDEXED
        assert doc.chunk_count == 5
        assert doc.indexed_at is not None

    @pytest.mark.parametrize("invalid_filename", ["doc.exe", "file.bat", "test"])
    def test_invalid_filename_extension(self, invalid_filename: str) -> None:
        """Test rejection of invalid file extensions."""
        with pytest.raises(ValidationError, match="Invalid file extension"):
            Document(
                space_id="s1",
                tenant_id="t1",
                filename=invalid_filename,
                size_bytes=100,
                content_hash="hash",
                blob_url="url",
                uploaded_by="user",
            )


class TestQuery:
    """Test suite for Query entity."""

    def test_query_creation(self) -> None:
        """Test query creation."""
        query = Query(
            space_id="s1",
            tenant_id="t1",
            question="What is the policy?",
            user_id="user1",
        )
        assert query.question == "What is the policy?"
        assert query.status == QueryStatus.PENDING

    def test_mark_as_completed(self) -> None:
        """Test marking query as completed."""
        query = Query(
            space_id="s1", tenant_id="t1", question="Question?", user_id="user1"
        )
        citation = Citation(
            document_id="doc1",
            chunk_id="chunk1",
            document_name="policy.pdf",
            relevance_score=0.95,
            excerpt="Policy excerpt",
        )
        query.mark_as_completed("Answer text", [citation], 150)
        assert query.status == QueryStatus.COMPLETED
        assert query.answer == "Answer text"
        assert len(query.citations) == 1
        assert query.processing_time_ms == 150

    def test_mark_as_failed(self) -> None:
        """Test marking query as failed."""
        query = Query(
            space_id="s1", tenant_id="t1", question="Question?", user_id="user1"
        )
        query.mark_as_failed("Error occurred")
        assert query.status == QueryStatus.FAILED
        assert query.error_message == "Error occurred"
        assert query.completed_at is not None


class TestConversation:
    """Test suite for Conversation entity."""

    def test_conversation_creation(self) -> None:
        """Test conversation creation."""
        conv = Conversation(
            space_id="s1",
            tenant_id="t1",
            title="Discussion",
            user_id="user1",
        )
        assert conv.title == "Discussion"
        assert conv.status == ConversationStatus.ACTIVE
        assert conv.query_count == 0

    def test_add_query(self) -> None:
        """Test adding query to conversation."""
        conv = Conversation(
            space_id="s1", tenant_id="t1", title="Discussion", user_id="user1"
        )
        initial_count = conv.query_count
        conv.add_query("query1")
        assert conv.query_count == initial_count + 1
        assert conv.last_query_at is not None
