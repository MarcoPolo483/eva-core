"""Tests for domain events."""

from datetime import datetime

import pytest

from eva_core.domain.events.base import DomainEvent
from eva_core.domain.events.query_events import (
    QueryCompleted,
    QueryExecuted,
    QueryFailed,
)
from eva_core.domain.events.space_events import (
    DocumentAdded,
    MemberAdded,
    SpaceCreated,
)


class TestDomainEvent:
    """Tests for DomainEvent base class."""

    def test_domain_event_creation(self) -> None:
        """Test creating a domain event."""
        event = DomainEvent(
            event_type="TestEvent",
            aggregate_id="agg-123",
            tenant_id="tenant-456",
        )

        assert event.event_id
        assert event.event_type == "TestEvent"
        assert event.aggregate_id == "agg-123"
        assert event.tenant_id == "tenant-456"
        assert isinstance(event.timestamp, datetime)
        assert event.metadata == {}

    def test_domain_event_with_metadata(self) -> None:
        """Test domain event with metadata."""
        event = DomainEvent(
            event_type="TestEvent",
            aggregate_id="agg-123",
            tenant_id="tenant-456",
            metadata={"user_id": "user-789", "ip": "192.168.1.1"},
        )

        assert event.metadata == {"user_id": "user-789", "ip": "192.168.1.1"}

    def test_domain_event_immutable(self) -> None:
        """Test that domain events are immutable."""
        event = DomainEvent(
            event_type="TestEvent",
            aggregate_id="agg-123",
            tenant_id="tenant-456",
        )

        with pytest.raises(Exception):  # Pydantic ValidationError  # noqa: B017
            event.event_type = "ModifiedEvent"  # type: ignore[misc]


class TestSpaceEvents:
    """Tests for space-related domain events."""

    def test_space_created_event(self) -> None:
        """Test SpaceCreated event."""
        event = SpaceCreated(
            space_id="space-123",
            aggregate_id="space-123",
            tenant_id="tenant-456",
            space_name="Policy Research",
            owner_id="user-789",
            visibility="private",
        )

        assert event.event_type == "SpaceCreated"
        assert event.space_id == "space-123"
        assert event.space_name == "Policy Research"
        assert event.owner_id == "user-789"
        assert event.visibility == "private"

    def test_document_added_event(self) -> None:
        """Test DocumentAdded event."""
        event = DocumentAdded(
            space_id="space-123",
            aggregate_id="space-123",
            tenant_id="tenant-456",
            document_id="doc-abc",
            document_name="policy.pdf",
            document_type="policy",
            size_bytes=1024000,
            uploaded_by="user-789",
        )

        assert event.event_type == "DocumentAdded"
        assert event.space_id == "space-123"
        assert event.document_id == "doc-abc"
        assert event.document_name == "policy.pdf"
        assert event.document_type == "policy"
        assert event.size_bytes == 1024000
        assert event.uploaded_by == "user-789"

    def test_member_added_event(self) -> None:
        """Test MemberAdded event."""
        event = MemberAdded(
            space_id="space-123",
            aggregate_id="space-123",
            tenant_id="tenant-456",
            user_id="user-999",
            role="viewer",
            added_by="user-789",
        )

        assert event.event_type == "MemberAdded"
        assert event.space_id == "space-123"
        assert event.user_id == "user-999"
        assert event.role == "viewer"
        assert event.added_by == "user-789"

    def test_document_added_validates_size(self) -> None:
        """Test DocumentAdded validates positive size."""
        with pytest.raises(Exception):  # Pydantic ValidationError  # noqa: B017
            DocumentAdded(
                space_id="space-123",
                aggregate_id="space-123",
                tenant_id="tenant-456",
                document_id="doc-abc",
                document_name="policy.pdf",
                document_type="policy",
                size_bytes=0,  # Invalid: must be > 0
                uploaded_by="user-789",
            )


class TestQueryEvents:
    """Tests for query-related domain events."""

    def test_query_executed_event(self) -> None:
        """Test QueryExecuted event."""
        event = QueryExecuted(
            query_id="query-123",
            aggregate_id="query-123",
            tenant_id="tenant-456",
            space_id="space-789",
            question="What is the remote work policy?",
            user_id="user-999",
        )

        assert event.event_type == "QueryExecuted"
        assert event.query_id == "query-123"
        assert event.space_id == "space-789"
        assert event.question == "What is the remote work policy?"
        assert event.user_id == "user-999"

    def test_query_completed_event(self) -> None:
        """Test QueryCompleted event."""
        event = QueryCompleted(
            query_id="query-123",
            aggregate_id="query-123",
            tenant_id="tenant-456",
            answer_length=500,
            citation_count=3,
            processing_time_ms=2500,
            tokens_used=1500,
        )

        assert event.event_type == "QueryCompleted"
        assert event.query_id == "query-123"
        assert event.answer_length == 500
        assert event.citation_count == 3
        assert event.processing_time_ms == 2500
        assert event.tokens_used == 1500

    def test_query_failed_event(self) -> None:
        """Test QueryFailed event."""
        event = QueryFailed(
            query_id="query-123",
            aggregate_id="query-123",
            tenant_id="tenant-456",
            error_type="timeout",
            error_message="RAG engine timeout after 30s",
        )

        assert event.event_type == "QueryFailed"
        assert event.query_id == "query-123"
        assert event.error_type == "timeout"
        assert event.error_message == "RAG engine timeout after 30s"

    def test_query_completed_validates_metrics(self) -> None:
        """Test QueryCompleted validates non-negative metrics."""
        with pytest.raises(Exception):  # Pydantic ValidationError  # noqa: B017
            QueryCompleted(
                query_id="query-123",
                aggregate_id="query-123",
                tenant_id="tenant-456",
                answer_length=-100,  # Invalid: must be >= 0
                citation_count=3,
                processing_time_ms=2500,
                tokens_used=1500,
            )

    def test_query_completed_validates_processing_time(self) -> None:
        """Test QueryCompleted validates positive processing time."""
        with pytest.raises(Exception):  # Pydantic ValidationError  # noqa: B017
            QueryCompleted(
                query_id="query-123",
                aggregate_id="query-123",
                tenant_id="tenant-456",
                answer_length=500,
                citation_count=3,
                processing_time_ms=0,  # Invalid: must be > 0
                tokens_used=1500,
            )
