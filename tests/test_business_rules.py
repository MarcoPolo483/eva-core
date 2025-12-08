"""Tests for entity business rules and domain events integration."""

import pytest

from eva_core.domain.entities.query import Query
from eva_core.domain.entities.space import Space, SpaceVisibility
from eva_core.domain.entities.user import User, UserRole


class TestSpaceBusinessRules:
    """Tests for Space entity business rules."""

    def test_space_emits_space_created_event(self) -> None:
        """Test Space can emit SpaceCreated event."""
        space = Space(
            tenant_id="tenant-123",
            name="Policy Research",
            owner_id="user-456",
            visibility=SpaceVisibility.PRIVATE,
        )

        space.emit_space_created()
        events = space.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "SpaceCreated"
        assert event.space_id == space.id
        assert event.tenant_id == "tenant-123"
        assert event.space_name == "Policy Research"
        assert event.owner_id == "user-456"
        assert event.visibility == "private"

    def test_space_emits_document_added_event(self) -> None:
        """Test Space can emit DocumentAdded event."""
        space = Space(
            tenant_id="tenant-123",
            name="Policy Research",
            owner_id="user-456",
        )

        space.emit_document_added(
            document_id="doc-123",
            document_name="policy.pdf",
            document_type="policy",
            size_bytes=1024000,
            uploaded_by="user-789",
        )
        events = space.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "DocumentAdded"
        assert event.space_id == space.id
        assert event.document_id == "doc-123"
        assert event.document_name == "policy.pdf"
        assert event.size_bytes == 1024000

    def test_space_emits_member_added_event(self) -> None:
        """Test Space can emit MemberAdded event."""
        space = Space(
            tenant_id="tenant-123",
            name="Policy Research",
            owner_id="user-456",
        )

        space.emit_member_added(
            user_id="user-999",
            role="viewer",
            added_by="user-456",
        )
        events = space.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "MemberAdded"
        assert event.space_id == space.id
        assert event.user_id == "user-999"
        assert event.role == "viewer"

    def test_space_collect_events_clears_list(self) -> None:
        """Test collecting events clears the event list."""
        space = Space(
            tenant_id="tenant-123",
            name="Policy Research",
            owner_id="user-456",
        )

        space.emit_space_created()
        events1 = space.collect_events()
        assert len(events1) == 1

        events2 = space.collect_events()
        assert len(events2) == 0  # Should be empty after first collect


class TestQueryBusinessRules:
    """Tests for Query entity business rules."""

    def test_query_emits_query_executed_event(self) -> None:
        """Test Query can emit QueryExecuted event."""
        query = Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the remote work policy?",
            user_id="user-789",
        )

        query.emit_query_executed()
        events = query.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "QueryExecuted"
        assert event.query_id == query.id
        assert event.space_id == "space-123"
        assert event.question == "What is the remote work policy?"

    def test_query_emits_query_completed_event(self) -> None:
        """Test Query can emit QueryCompleted event after completion."""
        query = Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the remote work policy?",
            user_id="user-789",
        )

        # Complete the query first
        query.mark_as_completed(
            answer="Remote work is allowed 3 days per week.",
            citations=[],
            processing_time_ms=2500,
        )

        query.emit_query_completed()
        events = query.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "QueryCompleted"
        assert event.query_id == query.id
        assert event.answer_length == 39  # "Remote work is allowed 3 days per week."
        assert event.processing_time_ms == 2500

    def test_query_emits_query_failed_event(self) -> None:
        """Test Query can emit QueryFailed event after failure."""
        query = Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the remote work policy?",
            user_id="user-789",
        )

        # Fail the query first
        query.mark_as_failed("RAG engine timeout")

        query.emit_query_failed()
        events = query.collect_events()

        assert len(events) == 1
        event = events[0]
        assert event.event_type == "QueryFailed"
        assert event.query_id == query.id
        assert event.error_message == "RAG engine timeout"

    def test_query_cannot_emit_completed_when_not_completed(self) -> None:
        """Test QueryCompleted event cannot be emitted for incomplete query."""
        query = Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the remote work policy?",
            user_id="user-789",
        )

        with pytest.raises(ValueError, match="Cannot emit QueryCompleted"):
            query.emit_query_completed()

    def test_query_cannot_emit_failed_when_not_failed(self) -> None:
        """Test QueryFailed event cannot be emitted for non-failed query."""
        query = Query(
            space_id="space-123",
            tenant_id="tenant-456",
            question="What is the remote work policy?",
            user_id="user-789",
        )

        with pytest.raises(ValueError, match="Cannot emit QueryFailed"):
            query.emit_query_failed()


class TestUserBusinessRules:
    """Tests for User entity business rules."""

    def test_user_ensure_same_tenant_success(self) -> None:
        """Test ensure_same_tenant passes for same tenant."""
        user = User(
            tenant_id="tenant-123",
            email="test@example.com",
            name="Test User",
            auth_provider="entra_id",
            auth_sub="sub-123",
            created_by="admin",
        )

        # Should not raise
        user.ensure_same_tenant("tenant-123")

    def test_user_ensure_same_tenant_failure(self) -> None:
        """Test ensure_same_tenant raises for different tenant."""
        user = User(
            tenant_id="tenant-123",
            email="test@example.com",
            name="Test User",
            auth_provider="entra_id",
            auth_sub="sub-123",
            created_by="admin",
        )

        with pytest.raises(ValueError, match="Tenant isolation violation"):
            user.ensure_same_tenant("tenant-999")

    def test_admin_user_can_access_any_space_in_tenant(self) -> None:
        """Test admin users can access spaces in their tenant."""
        admin = User(
            tenant_id="tenant-123",
            email="admin@example.com",
            name="Admin User",
            auth_provider="entra_id",
            auth_sub="sub-admin",
            role=UserRole.ADMIN,
            created_by="system",
        )

        # Admin can access space in same tenant
        assert admin.can_access_space("other-user", "tenant-123")

        # But not in different tenant (tenant isolation still enforced)
        assert not admin.can_access_space("other-user", "tenant-999")
