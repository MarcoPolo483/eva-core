# Domain Events

Domain events represent significant occurrences in the business domain.

## Event System

EVA Core uses an in-memory event system where entities emit events that can be collected and processed.

## Base Event

All events extend `DomainEvent`:

```python
from eva_core.domain.events.base import DomainEvent

class MyEvent(DomainEvent):
    event_type: str = "my_event"
    entity_id: str
```

## Space Events

### SpaceCreated

Emitted when a new space is created.

```python
from eva_core.domain.events.space_events import SpaceCreated

event = SpaceCreated(
    space_id="space-123",
    tenant_id="tenant-456",
    name="Engineering",
    owner_id="user-789"
)
```

### DocumentAdded

Emitted when a document is uploaded to a space.

```python
from eva_core.domain.events.space_events import DocumentAdded

event = DocumentAdded(
    space_id="space-123",
    document_id="doc-456",
    filename="api-spec.pdf",
    size_bytes=1024000,
    uploaded_by="user-789"
)
```

### MemberAdded

Emitted when a user is added to a space.

```python
from eva_core.domain.events.space_events import MemberAdded

event = MemberAdded(
    space_id="space-123",
    user_id="user-456",
    added_by="user-789"
)
```

## Query Events

### QueryExecuted

Emitted when a query starts processing.

```python
from eva_core.domain.events.query_events import QueryExecuted

event = QueryExecuted(
    query_id="query-123",
    space_id="space-456",
    user_id="user-789",
    query_text="What are the API limits?"
)
```

### QueryCompleted

Emitted when a query finishes successfully.

```python
from eva_core.domain.events.query_events import QueryCompleted

event = QueryCompleted(
    query_id="query-123",
    sources_count=3,
    tokens_used=150,
    processing_time_ms=250
)
```

### QueryFailed

Emitted when a query fails.

```python
from eva_core.domain.events.query_events import QueryFailed

event = QueryFailed(
    query_id="query-123",
    error_message="Timeout connecting to index",
    error_code="TIMEOUT"
)
```

## Using Events

### Collecting Events

```python
# Entity emits events
space.emit_document_added(
    document_id="doc-123",
    filename="spec.pdf",
    size_bytes=1024,
    uploaded_by="user-456"
)

# Collect all events
events = space.collect_events()
for event in events:
    print(f"{event.event_type} at {event.timestamp}")
```

### Event Metadata

All events include:

```python
event = SpaceCreated(...)
print(event.event_id)      # Unique ID
print(event.event_type)    # "space_created"
print(event.timestamp)     # ISO 8601 timestamp
print(event.metadata)      # Optional dict
```

### Event Processing

```python
from eva_core.domain.events.base import DomainEvent

def process_event(event: DomainEvent) -> None:
    if event.event_type == "document_added":
        # Trigger indexing
        start_indexing(event.document_id)
    elif event.event_type == "query_completed":
        # Log analytics
        log_query_metrics(event.query_id, event.tokens_used)

# Process collected events
for event in space.collect_events():
    process_event(event)
```

## Event Immutability

Events are immutable once created:

```python
event = SpaceCreated(...)
# event.space_id = "other"  # Raises Pydantic ValidationError
```

## See Also

- [Entities](entities.md)
- [API Reference](../api/events.md)
