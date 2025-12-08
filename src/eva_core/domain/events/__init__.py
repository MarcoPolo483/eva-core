"""Domain events for EVA Core.

Domain events represent business-significant occurrences that have happened
in the domain. They are immutable and should be named in the past tense.
"""

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

__all__ = [
    "DocumentAdded",
    # Base
    "DomainEvent",
    "MemberAdded",
    "QueryCompleted",
    # Query Events
    "QueryExecuted",
    "QueryFailed",
    # Space Events
    "SpaceCreated",
]
