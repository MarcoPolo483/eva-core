"""Base domain event class.

All domain events in EVA Core inherit from DomainEvent.
Events are immutable and represent something that has already happened.
"""

import uuid
from datetime import UTC, datetime
from typing import Any

from pydantic import BaseModel, Field


class DomainEvent(BaseModel):
    """Base class for all domain events.

    Domain events represent business-significant occurrences in the system.
    They are immutable, auditable, and can be used for event sourcing,
    integration with other systems, or triggering side effects.

    Attributes:
        event_id: Unique identifier for this event occurrence.
        event_type: Type of event (e.g., "SpaceCreated", "QueryExecuted").
        aggregate_id: ID of the aggregate root that generated this event.
        tenant_id: Tenant isolation boundary (all events belong to a tenant).
        timestamp: When the event occurred (UTC).
        metadata: Additional contextual information (user_id, IP, etc.).

    Example:
        >>> event = DomainEvent(
        ...     event_type="UserRegistered",
        ...     aggregate_id="user-123",
        ...     tenant_id="tenant-456"
        ... )
    """

    # Event Identity
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str = Field(min_length=1, max_length=100)

    # Aggregate Root
    aggregate_id: str = Field(min_length=1)

    # Tenant Isolation
    tenant_id: str = Field(min_length=1)

    # Timestamp
    timestamp: datetime = Field(default_factory=lambda: datetime.now(UTC))

    # Context
    metadata: dict[str, Any] = Field(default_factory=dict)

    class Config:
        """Pydantic config."""

        frozen = True  # Events are immutable
        str_strip_whitespace = True
