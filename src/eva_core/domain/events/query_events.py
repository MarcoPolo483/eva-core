"""Query-related domain events.

Events related to query lifecycle and processing.
"""

from pydantic import Field

from eva_core.domain.events.base import DomainEvent


class QueryExecuted(DomainEvent):
    """Event emitted when a query is executed (submitted to RAG engine).

    Attributes:
        query_id: ID of the query.
        space_id: Space where query was executed.
        question: The question asked.
        user_id: User who submitted the query.

    Example:
        >>> event = QueryExecuted(
        ...     query_id="query-123",
        ...     aggregate_id="query-123",
        ...     tenant_id="tenant-456",
        ...     space_id="space-789",
        ...     question="What is the remote work policy?",
        ...     user_id="user-999"
        ... )
    """

    event_type: str = Field(default="QueryExecuted", frozen=True)
    query_id: str = Field(min_length=1)
    space_id: str = Field(min_length=1)
    question: str = Field(min_length=1, max_length=1000)
    user_id: str = Field(min_length=1)


class QueryCompleted(DomainEvent):
    """Event emitted when a query processing completes successfully.

    Attributes:
        query_id: ID of the query.
        answer_length: Length of the generated answer.
        citation_count: Number of citations.
        processing_time_ms: Time taken to process (milliseconds).
        tokens_used: Number of tokens consumed.

    Example:
        >>> event = QueryCompleted(
        ...     query_id="query-123",
        ...     aggregate_id="query-123",
        ...     tenant_id="tenant-456",
        ...     answer_length=500,
        ...     citation_count=3,
        ...     processing_time_ms=2500,
        ...     tokens_used=1500
        ... )
    """

    event_type: str = Field(default="QueryCompleted", frozen=True)
    query_id: str = Field(min_length=1)
    answer_length: int = Field(ge=0)
    citation_count: int = Field(ge=0)
    processing_time_ms: int = Field(gt=0)
    tokens_used: int = Field(ge=0)


class QueryFailed(DomainEvent):
    """Event emitted when query processing fails.

    Attributes:
        query_id: ID of the query.
        error_type: Classification of error (e.g., "timeout", "llm_error").
        error_message: Human-readable error message.

    Example:
        >>> event = QueryFailed(
        ...     query_id="query-123",
        ...     aggregate_id="query-123",
        ...     tenant_id="tenant-456",
        ...     error_type="timeout",
        ...     error_message="RAG engine timeout after 30s"
        ... )
    """

    event_type: str = Field(default="QueryFailed", frozen=True)
    query_id: str = Field(min_length=1)
    error_type: str = Field(min_length=1, max_length=50)
    error_message: str = Field(min_length=1, max_length=500)
