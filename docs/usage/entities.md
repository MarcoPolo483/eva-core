# Entities

## Overview

EVA Core provides 7 core domain entities that model the business logic of a multi-tenant RAG system.

## Entity Hierarchy

```
Tenant
├── User
├── Space
│   ├── Document
│   └── Query
└── Conversation
    └── Query
```

## Tenant

The top-level entity representing an organization or customer.

**Key Features:**
- URL-safe slug for routing
- Quota management (storage, users, spaces)
- Status tracking (active, suspended, trial)

**Example:**
```python
from eva_core.domain.entities.tenant import Tenant

tenant = Tenant(
    name="Acme Corp",
    slug="acme-corp",
    created_by="admin"
)
```

## User

Represents authenticated users with role-based access control.

**Key Features:**
- Multi-provider authentication (Entra ID, Auth0, etc.)
- Role system (admin, member, viewer)
- PII masking for email and name
- Preference management

**Example:**
```python
from eva_core.domain.entities.user import User, UserRole

user = User(
    tenant_id="tenant-123",
    email="alice@example.com",
    name="Alice Smith",
    auth_provider="entra_id",
    auth_sub="auth0|12345",
    role=UserRole.ADMIN,
    created_by="system"
)
```

## Space

A container for documents with member-based access control.

**Key Features:**
- Visibility control (private, shared, public)
- Member management with roles
- Document quota enforcement
- Member addition events

**Example:**
```python
from eva_core.domain.entities.space import Space, SpaceMember

space = Space(
    tenant_id="tenant-123",
    name="Engineering Docs",
    owner_id="user-456"
)

# Add member
space.members.append(
    SpaceMember(user_id="user-789", added_by="user-456")
)
```

## Document

Represents uploaded files in a space.

**Key Features:**
- Content hash for deduplication
- Status tracking (pending, indexed, failed)
- Metadata storage (filename, MIME type, size)
- Indexing lifecycle management

**Example:**
```python
from eva_core.domain.entities.document import Document

document = Document(
    tenant_id="tenant-123",
    space_id="space-456",
    filename="api-spec.pdf",
    content_type="application/pdf",
    content_hash="sha256:abc123...",
    blob_url="https://storage/docs/api-spec.pdf",
    size_bytes=1024000,
    uploaded_by="user-789"
)

# Mark as indexed
document.mark_as_indexed(index_id="idx-123")
```

## Query

Represents a user question to the RAG system.

**Key Features:**
- Status lifecycle (pending, completed, failed)
- Citation tracking
- Token usage metrics
- Processing time tracking

**Example:**
```python
from eva_core.domain.entities.query import Query, Citation

query = Query(
    tenant_id="tenant-123",
    space_id="space-456",
    user_id="user-789",
    query_text="What are the API rate limits?",
    conversation_id="conv-abc"
)

# Complete with response
query.mark_as_completed(
    response_text="The API rate limit is 1000 requests per hour...",
    citations=[
        Citation(document_id="doc-1", page_number=5, snippet="Rate limit: 1000/hr")
    ],
    sources_count=1,
    tokens_used=150,
    processing_time_ms=250
)
```

## Conversation

Groups related queries in a thread.

**Key Features:**
- Query history tracking
- Metadata storage for UI state
- Query addition with ordering

**Example:**
```python
from eva_core.domain.entities.conversation import Conversation

conversation = Conversation(
    tenant_id="tenant-123",
    space_id="space-456",
    user_id="user-789",
    title="API Questions"
)

# Add query
conversation.add_query(query.id)
```

## Common Patterns

### Tenant Isolation

All entities include `tenant_id` for multi-tenancy:

```python
# Always filter by tenant_id
user = await user_repo.get_by_email("alice@example.com", tenant_id="tenant-123")
```

### Access Control

```python
# Check if user can access space
if user.can_access_space(space, tenant_id):
    # Allow access
    pass
```

### Event Emission

```python
# Entities emit domain events
space.emit_document_added(doc.id, doc.filename, doc.size_bytes, user.id)
events = space.collect_events()
```

## See Also

- [Domain Events](domain-events.md)
- [Repositories](repositories.md)
- [API Reference](../api/entities.md)
