"""Query entity - user question sent to RAG engine with answer and citations.

Example:
    >>> from eva_core.domain.entities.query import Query, Citation
    >>> query = Query(
    ...     space_id="space-123",
    ...     tenant_id="tenant-456",
    ...     question="What is the policy on remote work?",
    ...     user_id="user-789"
    ... )
"""

import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, PrivateAttr


class QueryStatus(str, Enum):
    """Query processing status."""

    PENDING = "pending"  # Submitted, not yet processed
    PROCESSING = "processing"  # RAG engine working
    COMPLETED = "completed"  # Answer generated
    FAILED = "failed"  # Error occurred


class Citation(BaseModel):
    """Citation linking answer to source document.

    Attributes:
        document_id: Source document ID.
        chunk_id: Source chunk ID.
        document_name: Source document name.
        page_number: Page number (optional).
        relevance_score: Relevance score (0.0-1.0).
        excerpt: Text snippet from source.
    """

    document_id: str
    chunk_id: str
    document_name: str
    page_number: int | None = None
    relevance_score: float = Field(ge=0.0, le=1.0)
    excerpt: str = Field(max_length=500)  # Text snippet


class Query(BaseModel):
    """Query entity (user question to RAG engine).

    User question sent to RAG engine (with answer + citations).

    Attributes:
        id: Unique identifier.
        space_id: Space where query was executed.
        tenant_id: Tenant isolation.
        conversation_id: Optional conversation grouping.
        question: User question text.
        language: Question language (en, fr).
        answer: Generated answer (optional).
        citations: Source citations.
        status: Processing status.
        error_message: Error message if failed (optional).
        processing_time_ms: Processing time in milliseconds (optional).
        tokens_used: Number of tokens used (optional).
        user_id: User who submitted query.
        created_at: Creation timestamp.
        completed_at: Completion timestamp (optional).
    """

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    space_id: str  # Space where query was executed
    tenant_id: str  # Tenant isolation
    conversation_id: str | None = None  # Optional conversation grouping

    # Question
    question: str = Field(min_length=1, max_length=2000)
    language: str = "en"  # en, fr

    # Answer
    answer: str | None = None
    citations: list[Citation] = Field(default_factory=list)

    # Status
    status: QueryStatus = QueryStatus.PENDING
    error_message: str | None = None

    # Performance
    processing_time_ms: int | None = None
    tokens_used: int | None = None

    # Audit
    user_id: str  # User who submitted query
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: datetime | None = None

    # Domain Events (not persisted)
    _events: list[Any] = PrivateAttr(default_factory=list)

    def mark_as_completed(
        self, answer: str, citations: list[Citation], processing_time_ms: int
    ) -> None:
        """Mark query as completed (business logic).

        Args:
            answer: Generated answer text.
            citations: List of source citations.
            processing_time_ms: Processing time in milliseconds.

        Side Effects:
            - Sets answer
            - Sets citations
            - Sets status to COMPLETED
            - Sets processing_time_ms
            - Sets completed_at to current time
        """
        self.answer = answer
        self.citations = citations
        self.status = QueryStatus.COMPLETED
        self.processing_time_ms = processing_time_ms
        self.completed_at = datetime.now(UTC)

    def mark_as_failed(self, error_message: str) -> None:
        """Mark query as failed.

        Args:
            error_message: Error description.

        Side Effects:
            - Sets status to FAILED
            - Sets error_message
            - Sets completed_at to current time
        """
        self.status = QueryStatus.FAILED
        self.error_message = error_message
        self.completed_at = datetime.now(UTC)

    def emit_query_executed(self) -> None:
        """Emit QueryExecuted event."""
        from eva_core.domain.events.query_events import QueryExecuted

        event = QueryExecuted(
            query_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            space_id=self.space_id,
            question=self.question,
            user_id=self.user_id,
        )
        self._events.append(event)

    def emit_query_completed(self) -> None:
        """Emit QueryCompleted event."""
        from eva_core.domain.events.query_events import QueryCompleted

        if self.status != QueryStatus.COMPLETED or not self.answer:
            raise ValueError("Cannot emit QueryCompleted: query not completed")

        event = QueryCompleted(
            query_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            answer_length=len(self.answer),
            citation_count=len(self.citations),
            processing_time_ms=self.processing_time_ms or 0,
            tokens_used=self.tokens_used or 0,
        )
        self._events.append(event)

    def emit_query_failed(self) -> None:
        """Emit QueryFailed event."""
        from eva_core.domain.events.query_events import QueryFailed

        if self.status != QueryStatus.FAILED or not self.error_message:
            raise ValueError("Cannot emit QueryFailed: query not in failed state")

        event = QueryFailed(
            query_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            error_type="processing_error",
            error_message=self.error_message,
        )
        self._events.append(event)

    def collect_events(self) -> list[Any]:
        """Collect and clear domain events."""
        events = self._events.copy()
        self._events.clear()
        return events
