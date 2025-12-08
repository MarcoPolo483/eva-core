# Quick Start

## Basic Usage

### Creating a Tenant

```python
from eva_core.domain.entities.tenant import Tenant

tenant = Tenant(
    name="Acme Corp",
    slug="acme-corp",
    created_by="admin@acme.com"
)
print(f"Created tenant: {tenant.name} ({tenant.id})")
```

### Creating a User

```python
from eva_core.domain.entities.user import User, UserRole

user = User(
    tenant_id=tenant.id,
    email="alice@acme.com",
    name="Alice Smith",
    auth_provider="entra_id",
    auth_sub="auth0|12345",
    role=UserRole.ADMIN,
    created_by="system"
)
```

### Creating a Space

```python
from eva_core.domain.entities.space import Space, SpaceVisibility

space = Space(
    tenant_id=tenant.id,
    name="Engineering Docs",
    owner_id=user.id,
    visibility=SpaceVisibility.PRIVATE
)
```

### Adding a Document

```python
from eva_core.domain.entities.document import Document

document = Document(
    tenant_id=tenant.id,
    space_id=space.id,
    filename="api-spec.pdf",
    content_type="application/pdf",
    content_hash="abc123...",
    blob_url="https://storage.example.com/docs/api-spec.pdf",
    size_bytes=1024000,
    uploaded_by=user.id
)
```

### Creating a Query

```python
from eva_core.domain.entities.query import Query

query = Query(
    tenant_id=tenant.id,
    space_id=space.id,
    user_id=user.id,
    query_text="What are the API authentication methods?",
    conversation_id="conv-123"
)

# Mark as completed
query.mark_as_completed(
    response_text="Our API supports OAuth 2.0 and API keys...",
    sources_count=3,
    tokens_used=150
)
```

## Using Value Objects

### Email with PII Masking

```python
from eva_core.domain.value_objects.email import Email

email = Email(value="alice@example.com")
print(email.mask())  # Output: "a****@e******.com"
```

### Phone Number

```python
from eva_core.domain.value_objects.phone_number import PhoneNumber

phone = PhoneNumber(value="5551234567")
print(phone.mask())  # Output: "*****34567"
```

## Domain Events

```python
# Spaces emit events when documents are added
space.emit_document_added(
    document_id=document.id,
    filename=document.filename,
    size_bytes=document.size_bytes,
    uploaded_by=user.id
)

# Collect all events
events = space.collect_events()
for event in events:
    print(f"Event: {event.event_type} at {event.timestamp}")
```

## Repository Pattern

```python
from eva_core.domain.repositories.memory import InMemoryUserRepository

# Create repository
user_repo = InMemoryUserRepository()

# Save user
await user_repo.save(user)

# Retrieve by ID
retrieved = await user_repo.get(user.id)

# Query by email
found = await user_repo.get_by_email("alice@acme.com", tenant.id)

# List users in tenant
users = await user_repo.list_by_tenant(tenant.id)
```

## Next Steps

- Explore [Entity Documentation](../usage/entities.md)
- Learn about [Domain Events](../usage/domain-events.md)
- Read the [API Reference](../api/entities.md)
