# EVA Core Domain Models & Business Logic (eva-core)

**Comprehensive Specification for Autonomous Implementation**

---

## 1. Vision & Business Value

### What This Service Delivers

EVA-Core is the **domain model foundation** for the entire EVA Suite. It provides:

- **Domain Entities**: User, Tenant, Space, Document, Query, Conversation (Pydantic models with validation)
- **Business Logic**: Rules for tenant isolation, space permissions, document ownership, query validation
- **Domain Events**: SpaceCreated, DocumentAdded, QueryExecuted, ConversationUpdated (event-driven architecture)
- **Repository Patterns**: Abstract interfaces for data access (Cosmos DB, Blob Storage, Redis)
- **Value Objects**: Email, PhoneNumber, SIN (with PII masking), ContentHash, Citation
- **Aggregate Roots**: Space (contains Documents + Conversations), User (contains Preferences + Sessions)

### Success Metrics

- **Reusability**: 100% of EVA Suite services use eva-core models (no duplicate entity definitions)
- **Validation**: Zero invalid data in Cosmos DB (Pydantic validation at boundaries)
- **Performance**: Model serialization < 10ms (p95), validation < 5ms (p95)
- **Type Safety**: 100% type coverage (mypy strict mode passing)

### Business Impact

- **Consistency**: Single source of truth for domain models (no schema drift across services)
- **Maintainability**: Change entity once, all services get update (DRY principle)
- **Testing**: Mock repositories enable fast unit tests (no database dependencies)
- **Compliance**: PII masking built into models (SIN/email/phone automatically masked in logs)

---

## 2. Architecture Overview

### System Context

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EVA Suite Services                          │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │ eva-api  │  │ eva-auth │  │ eva-rag  │  │ eva-ui   │  ...       │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘           │
│       │             │             │             │                   │
│       └─────────────┴─────────────┴─────────────┘                   │
│                           │                                         │
│                           ▼                                         │
│       ┌───────────────────────────────────────────┐                │
│       │      eva-core (This Package)              │                │
│       │  Domain Models │ Business Logic │ Events  │                │
│       └───────────┬───────────────────────────────┘                │
│                   │                                                 │
└───────────────────┼─────────────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌────────────────┐     ┌────────────────────┐
│  Cosmos DB     │     │  Azure Blob Storage│
│  (Entities)    │     │  (Documents)       │
└────────────────┘     └────────────────────┘
```

### Domain Model Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          eva-core Package                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Domain Entities                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐     │  │
│  │  │   User   │  │  Tenant  │  │  Space   │  │ Document │     │  │
│  │  │ (Aggr.)  │  │ (Aggr.)  │  │ (Aggr.)  │  │ (Entity) │     │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘     │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐                   │  │
│  │  │  Query   │  │ Convers. │  │ Citation │                   │  │
│  │  │ (Entity) │  │ (Entity) │  │ (Value)  │                   │  │
│  │  └──────────┘  └──────────┘  └──────────┘                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐  │
│  │                   Business Logic                              │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ Validation   │  │ Authorization│  │ PII Masking  │       │  │
│  │  │ Rules        │  │ Rules        │  │ Rules        │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐  │
│  │                   Domain Events                               │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │SpaceCreated  │  │DocumentAdded │  │QueryExecuted │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                           │                                         │
│  ┌────────────────────────▼─────────────────────────────────────┐  │
│  │                Repository Interfaces                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │UserRepository│  │SpaceRepos.   │  │DocumentRepos.│       │  │
│  │  │ (Abstract)   │  │ (Abstract)   │  │ (Abstract)   │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technical Stack

### Primary Technologies

- **Language**: Python 3.11+ (type hints, dataclasses, async/await)
- **Validation**: Pydantic 2.x (data validation, serialization, JSON schema generation)
- **Testing**: pytest + pytest-asyncio + hypothesis (property-based testing for validation rules)
- **Type Checking**: mypy (strict mode, 100% type coverage)
- **Linting**: ruff (fast Python linter/formatter)
- **Documentation**: MkDocs + mkdocstrings (auto-generated API docs from docstrings)

### Domain-Driven Design Patterns

- **Entities**: Objects with unique identity (User, Space, Document, Query, Conversation)
- **Value Objects**: Immutable objects without identity (Email, PhoneNumber, ContentHash, Citation)
- **Aggregate Roots**: Consistency boundaries (Space contains Documents, User contains Preferences)
- **Repositories**: Abstract data access interfaces (UserRepository, SpaceRepository, DocumentRepository)
- **Domain Events**: State change notifications (SpaceCreated, DocumentAdded, QueryExecuted)
- **Domain Services**: Stateless operations spanning multiple entities (TenantIsolationService, PermissionService)

### Validation Strategy

- **Pydantic Validators**: Field-level validation (email format, SIN format, phone number format)
- **Model Validators**: Cross-field validation (start_date < end_date, document size limits)
- **Invariants**: Business rules enforced in aggregate roots (Space must have at least 1 owner)
- **Hypothesis**: Property-based testing for validation rules (generate random invalid data, ensure rejection)

---

## 4. Domain Entities

### 4.1 User (Aggregate Root)

**Purpose**: Represents a person using EVA (citizen or employee).

**Schema**:
```python
# src/eva_core/domain/entities/user.py
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field, field_validator, EmailStr
from typing import Optional
import uuid

class UserRole(str, Enum):
    """User roles with increasing permissions."""
    VIEWER = "viewer"       # Read-only access
    ANALYST = "analyst"     # Can create queries, add documents
    ADMIN = "admin"         # Full control (user management, space management)
    SYSTEM = "system"       # Internal system operations

class UserStatus(str, Enum):
    """User account status."""
    ACTIVE = "active"       # Can use system
    SUSPENDED = "suspended" # Temporarily blocked
    DELETED = "deleted"     # Soft-deleted (retain audit trail)

class UserPreferences(BaseModel):
    """User preferences (UI settings, notifications)."""
    locale: str = "en-CA"                    # Language (en-CA, fr-CA)
    timezone: str = "America/Toronto"        # Timezone
    email_notifications: bool = True         # Email notifications enabled
    theme: str = "auto"                      # UI theme (light, dark, auto)
    results_per_page: int = 20               # Pagination default

class User(BaseModel):
    """User entity (aggregate root)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Organization/department ID (tenant isolation)

    # Profile
    email: EmailStr
    name: str = Field(min_length=1, max_length=200)
    role: UserRole = UserRole.VIEWER
    status: UserStatus = UserStatus.ACTIVE

    # Authentication (references eva-auth)
    auth_provider: str = "entra_id"  # entra_id, b2c
    auth_sub: str  # Subject claim from JWT (unique per provider)

    # Preferences
    preferences: UserPreferences = Field(default_factory=UserPreferences)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_login_at: Optional[datetime] = None

    # Audit
    created_by: str  # User ID who created this user (for admin actions)

    @field_validator("email")
    @classmethod
    def validate_email_domain(cls, v: str) -> str:
        """Validate email belongs to allowed domain (e.g., canada.ca)."""
        # Business rule: employees must use @canada.ca emails
        # Citizens can use any email (validated by Azure AD B2C)
        return v

    def can_access_space(self, space_owner_id: str, space_tenant_id: str) -> bool:
        """Check if user can access space (business logic)."""
        # Tenant isolation: user must be in same tenant
        if self.tenant_id != space_tenant_id:
            return False

        # Admins can access all spaces in their tenant
        if self.role == UserRole.ADMIN:
            return True

        # Users can only access spaces they own (checked elsewhere)
        return False

    def mask_pii(self) -> "User":
        """Return copy with PII masked (for logging/telemetry)."""
        masked = self.model_copy(deep=True)
        # Mask email: john.doe@example.com → j***e@e*****e.com
        email_parts = masked.email.split("@")
        masked.email = f"{email_parts[0][0]}***{email_parts[0][-1]}@{email_parts[1][0]}*****{email_parts[1][-1]}"
        # Mask name: John Doe → J*** D**
        name_parts = masked.name.split()
        masked.name = " ".join([f"{part[0]}***" for part in name_parts])
        return masked
```

**Business Rules**:
- Email must be unique per tenant
- Role changes logged as domain events (UserRoleChanged)
- Suspended users cannot create queries or add documents
- Deleted users retain ID for audit trail (soft delete)

---

### 4.2 Tenant (Aggregate Root)

**Purpose**: Represents an organization or department (multi-tenancy boundary).

**Schema**:
```python
# src/eva_core/domain/entities/tenant.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class TenantStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    ARCHIVED = "archived"

class TenantQuotas(BaseModel):
    """Resource limits per tenant."""
    max_users: int = 100
    max_spaces: int = 50
    max_documents_per_space: int = 10000
    max_storage_gb: int = 100
    max_queries_per_month: int = 10000

class Tenant(BaseModel):
    """Tenant entity (aggregate root for multi-tenancy)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # Profile
    name: str = Field(min_length=1, max_length=200)  # e.g., "Department of Example"
    slug: str = Field(pattern=r"^[a-z0-9-]+$")  # URL-safe identifier: dept-of-example
    status: TenantStatus = TenantStatus.ACTIVE

    # Configuration
    quotas: TenantQuotas = Field(default_factory=TenantQuotas)

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Audit
    created_by: str  # User ID (admin who created tenant)

    def is_quota_exceeded(self, resource: str, current_count: int) -> bool:
        """Check if resource quota is exceeded."""
        quotas_dict = self.quotas.model_dump()
        max_allowed = quotas_dict.get(f"max_{resource}", float("inf"))
        return current_count >= max_allowed
```

**Business Rules**:
- Slug must be unique across all tenants
- Users can only belong to one tenant
- Cross-tenant data access is forbidden (enforced in repositories)
- Suspended tenants: users can read but not write

---

### 4.3 Space (Aggregate Root)

**Purpose**: Container for documents and conversations (like a project workspace).

**Schema**:
```python
# src/eva_core/domain/entities/space.py
from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class SpaceVisibility(str, Enum):
    PRIVATE = "private"   # Only owners can access
    SHARED = "shared"     # Owners + explicit members can access
    PUBLIC = "public"     # All users in tenant can access

class SpaceStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class SpaceMember(BaseModel):
    """Member of a space with specific role."""
    user_id: str
    role: str = "viewer"  # viewer, contributor, owner
    added_at: datetime = Field(default_factory=datetime.utcnow)
    added_by: str  # User ID who added this member

class Space(BaseModel):
    """Space entity (aggregate root for documents + conversations)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Tenant isolation

    # Profile
    name: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=2000)
    visibility: SpaceVisibility = SpaceVisibility.PRIVATE
    status: SpaceStatus = SpaceStatus.ACTIVE

    # Access Control
    owner_id: str  # Primary owner (user ID)
    members: List[SpaceMember] = Field(default_factory=list)

    # Content Metadata
    document_count: int = 0
    conversation_count: int = 0
    total_size_bytes: int = 0

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)

    # Configuration
    tags: List[str] = Field(default_factory=list)

    @field_validator("members")
    @classmethod
    def validate_members(cls, v: List[SpaceMember]) -> List[SpaceMember]:
        """Ensure no duplicate members."""
        user_ids = [m.user_id for m in v]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate members not allowed")
        return v

    def has_member(self, user_id: str) -> bool:
        """Check if user is a member of this space."""
        return user_id == self.owner_id or any(m.user_id == user_id for m in self.members)

    def get_member_role(self, user_id: str) -> Optional[str]:
        """Get user's role in this space."""
        if user_id == self.owner_id:
            return "owner"
        for member in self.members:
            if member.user_id == user_id:
                return member.role
        return None

    def can_add_document(self, user_id: str) -> bool:
        """Check if user can add documents to this space."""
        role = self.get_member_role(user_id)
        return role in ["owner", "contributor"]

    def add_document(self, document_id: str, size_bytes: int):
        """Add document to space (business logic)."""
        self.document_count += 1
        self.total_size_bytes += size_bytes
        self.last_activity_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
```

**Business Rules**:
- Space must have at least 1 owner (invariant)
- Members cannot be added if visibility is PRIVATE (only owner access)
- Archived spaces are read-only (no new documents/queries)
- Space size cannot exceed tenant quota

---

### 4.4 Document (Entity)

**Purpose**: Represents a file uploaded to a space (policy doc, jurisprudence decision, guide).

**Schema**:
```python
# src/eva_core/domain/entities/document.py
from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import hashlib

class DocumentStatus(str, Enum):
    PENDING = "pending"       # Uploaded, not yet indexed
    PROCESSING = "processing" # Being chunked/embedded
    INDEXED = "indexed"       # Ready for queries
    FAILED = "failed"         # Processing failed
    DELETED = "deleted"       # Soft-deleted

class DocumentType(str, Enum):
    POLICY = "policy"
    JURISPRUDENCE = "jurisprudence"
    GUIDANCE = "guidance"
    FAQ = "faq"
    OTHER = "other"

class DocumentMetadata(BaseModel):
    """Document metadata (extracted during indexing)."""
    author: Optional[str] = None
    publication_date: Optional[datetime] = None
    effective_date: Optional[datetime] = None
    language: str = "en"  # en, fr
    page_count: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    custom_fields: Dict[str, Any] = Field(default_factory=dict)

class Document(BaseModel):
    """Document entity (owned by a Space)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    space_id: str  # Parent space
    tenant_id: str  # Tenant isolation

    # Content
    filename: str = Field(min_length=1, max_length=255)
    content_type: str = "application/pdf"  # MIME type
    size_bytes: int = Field(gt=0)
    content_hash: str  # SHA-256 hash (for deduplication)

    # Storage
    blob_url: str  # Azure Blob Storage URL

    # Classification
    document_type: DocumentType = DocumentType.OTHER
    status: DocumentStatus = DocumentStatus.PENDING

    # Metadata
    metadata: DocumentMetadata = Field(default_factory=DocumentMetadata)

    # Indexing
    chunk_count: int = 0  # Number of chunks created during indexing
    indexed_at: Optional[datetime] = None

    # Access
    uploaded_by: str  # User ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @staticmethod
    def compute_content_hash(content: bytes) -> str:
        """Compute SHA-256 hash of content (for deduplication)."""
        return hashlib.sha256(content).hexdigest()

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: str) -> str:
        """Ensure filename has valid extension."""
        allowed_extensions = [".pdf", ".docx", ".txt", ".md"]
        if not any(v.lower().endswith(ext) for ext in allowed_extensions):
            raise ValueError(f"Invalid file extension. Allowed: {allowed_extensions}")
        return v

    def is_duplicate(self, other_hash: str) -> bool:
        """Check if document is duplicate based on content hash."""
        return self.content_hash == other_hash

    def mark_as_indexed(self, chunk_count: int):
        """Mark document as successfully indexed."""
        self.status = DocumentStatus.INDEXED
        self.chunk_count = chunk_count
        self.indexed_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
```

**Business Rules**:
- Content hash must be unique per space (no duplicate documents)
- Document size cannot exceed 50MB (configurable)
- Only contributors and owners can upload documents
- Deleted documents retain metadata for 90 days (soft delete)

---

### 4.5 Query (Entity)

**Purpose**: User question sent to RAG engine (with answer + citations).

**Schema**:
```python
# src/eva_core/domain/entities/query.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class QueryStatus(str, Enum):
    PENDING = "pending"       # Submitted, not yet processed
    PROCESSING = "processing" # RAG engine working
    COMPLETED = "completed"   # Answer generated
    FAILED = "failed"         # Error occurred

class Citation(BaseModel):
    """Citation linking answer to source document."""
    document_id: str
    chunk_id: str
    document_name: str
    page_number: Optional[int] = None
    relevance_score: float = Field(ge=0.0, le=1.0)
    excerpt: str = Field(max_length=500)  # Text snippet

class Query(BaseModel):
    """Query entity (user question to RAG engine)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    space_id: str  # Space where query was executed
    tenant_id: str  # Tenant isolation
    conversation_id: Optional[str] = None  # Optional conversation grouping

    # Question
    question: str = Field(min_length=1, max_length=2000)
    language: str = "en"  # en, fr

    # Answer
    answer: Optional[str] = None
    citations: List[Citation] = Field(default_factory=list)

    # Status
    status: QueryStatus = QueryStatus.PENDING
    error_message: Optional[str] = None

    # Performance
    processing_time_ms: Optional[int] = None
    tokens_used: Optional[int] = None

    # Audit
    user_id: str  # User who submitted query
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

    def mark_as_completed(self, answer: str, citations: List[Citation], processing_time_ms: int):
        """Mark query as completed (business logic)."""
        self.answer = answer
        self.citations = citations
        self.status = QueryStatus.COMPLETED
        self.processing_time_ms = processing_time_ms
        self.completed_at = datetime.utcnow()

    def mark_as_failed(self, error_message: str):
        """Mark query as failed."""
        self.status = QueryStatus.FAILED
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
```

**Business Rules**:
- Query must belong to a space user has access to
- Citations must reference documents in the same space
- Failed queries retried max 3 times
- Query history retained for 2 years (compliance)

---

### 4.6 Conversation (Entity)

**Purpose**: Group related queries into a conversation thread.

**Schema**:
```python
# src/eva_core/domain/entities/conversation.py
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum
import uuid

class ConversationStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class Conversation(BaseModel):
    """Conversation entity (grouping of queries)."""

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    space_id: str
    tenant_id: str

    # Content
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    status: ConversationStatus = ConversationStatus.ACTIVE

    # Queries
    query_count: int = 0
    last_query_at: Optional[datetime] = None

    # Audit
    user_id: str  # Owner
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def add_query(self, query_id: str):
        """Add query to conversation."""
        self.query_count += 1
        self.last_query_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
```

---

## 5. Value Objects

### 5.1 Email (Value Object)

```python
# src/eva_core/domain/value_objects/email.py
from pydantic import BaseModel, EmailStr, field_validator

class Email(BaseModel):
    """Email value object with validation."""
    value: EmailStr

    def mask(self) -> str:
        """Mask email for logging: john.doe@example.com → j***e@e*****e.com"""
        parts = self.value.split("@")
        return f"{parts[0][0]}***{parts[0][-1]}@{parts[1][0]}*****{parts[1][-1]}"
```

### 5.2 PhoneNumber (Value Object)

```python
# src/eva_core/domain/value_objects/phone_number.py
from pydantic import BaseModel, field_validator
import re

class PhoneNumber(BaseModel):
    """Canadian phone number value object."""
    value: str

    @field_validator("value")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        """Validate Canadian phone number format."""
        # Remove formatting
        digits = re.sub(r"\D", "", v)

        # Must be 10 digits (Canadian)
        if len(digits) != 10:
            raise ValueError("Phone number must be 10 digits")

        # Format: (xxx) xxx-xxxx
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"

    def mask(self) -> str:
        """Mask phone for logging: (613) 555-1234 → (***) ***-1234"""
        return f"(***) ***{self.value[-5:]}"
```

### 5.3 SIN (Value Object with PII Masking)

```python
# src/eva_core/domain/value_objects/sin.py
from pydantic import BaseModel, field_validator
import re

class SIN(BaseModel):
    """Canadian Social Insurance Number (Protected B PII)."""
    value: str

    @field_validator("value")
    @classmethod
    def validate_sin(cls, v: str) -> str:
        """Validate SIN format (9 digits, Luhn checksum)."""
        # Remove spaces/dashes
        digits = re.sub(r"\D", "", v)

        # Must be 9 digits
        if len(digits) != 9:
            raise ValueError("SIN must be 9 digits")

        # Luhn checksum validation (CRA algorithm)
        checksum = sum(int(d) if i % 2 == 0 else sum(divmod(int(d) * 2, 10)) for i, d in enumerate(digits))
        if checksum % 10 != 0:
            raise ValueError("Invalid SIN checksum")

        # Format: xxx-xxx-xxx
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

    def mask(self) -> str:
        """Mask SIN for logging: 123-456-789 → ***-***-789"""
        return f"***-***{self.value[-4:]}"
```

---

## 6. Domain Events

### 6.1 Event Base Class

```python
# src/eva_core/domain/events/base.py
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Dict, Any
import uuid

class DomainEvent(BaseModel):
    """Base class for all domain events."""
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: str
    aggregate_id: str  # ID of entity that triggered event
    tenant_id: str
    user_id: str  # User who triggered event
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Dict[str, Any] = Field(default_factory=dict)
```

### 6.2 Space Events

```python
# src/eva_core/domain/events/space_events.py
from eva_core.domain.events.base import DomainEvent

class SpaceCreated(DomainEvent):
    event_type: str = "space.created"
    space_id: str
    space_name: str
    owner_id: str

class DocumentAdded(DomainEvent):
    event_type: str = "space.document.added"
    space_id: str
    document_id: str
    document_name: str
    size_bytes: int

class MemberAdded(DomainEvent):
    event_type: str = "space.member.added"
    space_id: str
    member_id: str
    role: str
```

### 6.3 Query Events

```python
# src/eva_core/domain/events/query_events.py
from eva_core.domain.events.base import DomainEvent

class QueryExecuted(DomainEvent):
    event_type: str = "query.executed"
    query_id: str
    space_id: str
    processing_time_ms: int
    citation_count: int

class QueryFailed(DomainEvent):
    event_type: str = "query.failed"
    query_id: str
    space_id: str
    error_message: str
```

---

## 7. Repository Interfaces

### 7.1 Base Repository

```python
# src/eva_core/repositories/base.py
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

T = TypeVar("T")

class Repository(ABC, Generic[T]):
    """Abstract repository interface."""

    @abstractmethod
    async def get_by_id(self, id: str) -> Optional[T]:
        """Get entity by ID."""
        pass

    @abstractmethod
    async def save(self, entity: T) -> T:
        """Save entity (insert or update)."""
        pass

    @abstractmethod
    async def delete(self, id: str) -> bool:
        """Delete entity."""
        pass

    @abstractmethod
    async def list(self, offset: int = 0, limit: int = 100) -> List[T]:
        """List entities with pagination."""
        pass
```

### 7.2 User Repository

```python
# src/eva_core/repositories/user_repository.py
from eva_core.repositories.base import Repository
from eva_core.domain.entities.user import User
from typing import Optional

class UserRepository(Repository[User]):
    """User repository interface."""

    async def get_by_email(self, email: str, tenant_id: str) -> Optional[User]:
        """Get user by email (within tenant)."""
        pass

    async def get_by_auth_sub(self, auth_sub: str, auth_provider: str) -> Optional[User]:
        """Get user by authentication subject (from JWT)."""
        pass

    async def list_by_tenant(self, tenant_id: str, offset: int = 0, limit: int = 100) -> List[User]:
        """List users in tenant."""
        pass
```

### 7.3 Space Repository

```python
# src/eva_core/repositories/space_repository.py
from eva_core.repositories.base import Repository
from eva_core.domain.entities.space import Space
from typing import List

class SpaceRepository(Repository[Space]):
    """Space repository interface."""

    async def list_by_tenant(self, tenant_id: str, offset: int = 0, limit: int = 100) -> List[Space]:
        """List spaces in tenant."""
        pass

    async def list_by_user(self, user_id: str, tenant_id: str, offset: int = 0, limit: int = 100) -> List[Space]:
        """List spaces user has access to."""
        pass
```

---

## 8. Quality Gates (All Must Pass)

### 1. Test Coverage: 100%
- **Tool**: pytest + Coverage.py + hypothesis
- **Command**: `pytest --cov=eva_core --cov-report=html --cov-fail-under=100`
- **Target**: 100% line coverage, 100% branch coverage
- **Property Testing**: Hypothesis for validation rules (generate 1000+ invalid inputs, ensure rejection)
- **Evidence**: Coverage report + hypothesis test results

### 2. Type Safety: 100%
- **Tool**: mypy (strict mode)
- **Command**: `mypy src/eva_core --strict`
- **Target**: Zero type errors
- **Evidence**: mypy output showing "Success: no issues found"

### 3. Data Validation
- **Invalid Data Rejection**: 100% of invalid entities rejected by Pydantic
- **PII Masking**: 100% of SIN/email/phone masked in logs
- **Business Rules**: All invariants enforced (tested)
- **Evidence**: Unit tests for validation, PII masking tests passing

### 4. Performance Benchmarks
- **Serialization**: < 10ms (p95) for entity to JSON
- **Validation**: < 5ms (p95) for Pydantic validation
- **Memory**: < 10MB per 1000 entities loaded
- **Evidence**: pytest-benchmark results

### 5. Documentation
- **Docstrings**: 100% of public APIs documented
- **API Docs**: MkDocs site generated from docstrings
- **Usage Examples**: Code snippets for each entity/repository
- **Evidence**: Published MkDocs site, usage examples tested

### 6. Code Quality
- **Linting**: ruff passing (no warnings)
- **Formatting**: ruff format applied consistently
- **Complexity**: McCabe complexity < 10 for all functions
- **Evidence**: ruff check output, complexity report

### 7. Dependency Management
- **Minimal Dependencies**: Only Pydantic + testing libraries
- **No Database Dependencies**: Repositories are abstract (implemented in eva-api/eva-rag)
- **Version Pinning**: All dependencies pinned in pyproject.toml
- **Evidence**: pyproject.toml review

### 8. Internationalization
- **Bilingual Validation Errors**: EN-CA/FR-CA error messages
- **Field Labels**: Bilingual field descriptions
- **Evidence**: i18n test suite passing

### 9. Security
- **PII Masking**: Automatic masking in __repr__ and logs
- **No Secrets in Models**: Configuration via environment variables only
- **Input Validation**: All user inputs validated by Pydantic
- **Evidence**: Security audit checklist, PII masking tests

### 10. Packaging
- **Python Package**: Installable via `pip install eva-core`
- **Version**: Semantic versioning (1.0.0)
- **Type Stubs**: py.typed marker for type checkers
- **Evidence**: Package installed in test environment, types recognized by mypy

### 11. CI/CD
- **GitHub Actions**: All checks passing on pull requests
- **Test Matrix**: Python 3.11, 3.12 tested
- **Build**: Package builds successfully
- **Evidence**: CI/CD workflow logs

### 12. Developer Experience
- **Setup Time**: < 3 minutes (poetry install)
- **Type Hints**: 100% coverage for IDE autocomplete
- **Clear Error Messages**: Pydantic validation errors human-readable
- **Evidence**: Developer feedback, onboarding time tracking

---

## 9. Implementation Phases (4 Phases, 6 Weeks)

### Phase 1: Core Entities (Week 1-2)
**Goal**: Define and validate all domain entities

**Tasks**:
1. Project setup: Poetry, pytest, mypy, ruff, pre-commit hooks
2. User entity: Pydantic model, validation, PII masking, tests
3. Tenant entity: Pydantic model, quotas, tests
4. Space entity: Pydantic model, members, access control logic, tests
5. Document entity: Pydantic model, content hash, deduplication, tests
6. Query entity: Pydantic model, citations, status management, tests
7. Conversation entity: Pydantic model, tests
8. Value objects: Email, PhoneNumber, SIN (with masking), tests

**Deliverables**:
- All entities defined with Pydantic
- 100% test coverage for Phase 1 modules
- mypy passing (strict mode)

**Evidence**:
- `pytest --cov=eva_core --cov-report=html` passing
- `mypy src/eva_core --strict` passing
- Code examples for each entity

---

### Phase 2: Domain Events & Business Logic (Week 3-4)
**Goal**: Implement domain events and business rules

**Tasks**:
1. Event base class: DomainEvent with metadata
2. Space events: SpaceCreated, DocumentAdded, MemberAdded
3. Query events: QueryExecuted, QueryFailed
4. Business logic: User.can_access_space(), Space.can_add_document()
5. Validation rules: Hypothesis property tests (1000+ invalid inputs)
6. Aggregate invariants: Space must have owner, Document must be unique
7. Tests: Event serialization, business logic, invariants

**Deliverables**:
- Domain events defined
- Business logic implemented and tested
- Hypothesis tests passing

**Evidence**:
- Event JSON schema examples
- Business logic tests passing
- Hypothesis test report (1000+ cases)

---

### Phase 3: Repository Interfaces (Week 5)
**Goal**: Define abstract repository interfaces

**Tasks**:
1. Base repository: Generic CRUD operations
2. User repository: get_by_email, get_by_auth_sub, list_by_tenant
3. Tenant repository: get_by_slug
4. Space repository: list_by_user, list_by_tenant
5. Document repository: get_by_hash (deduplication), list_by_space
6. Query repository: list_by_space, list_by_conversation
7. Conversation repository: list_by_space
8. Mock implementations: For unit tests (in-memory)

**Deliverables**:
- Repository interfaces defined
- Mock implementations for testing
- Usage examples

**Evidence**:
- Repository interface code
- Mock repository tests passing
- Usage guide

---

### Phase 4: Packaging & Documentation (Week 6)
**Goal**: Publish Python package with complete documentation

**Tasks**:
1. pyproject.toml: Package metadata, dependencies, version
2. MkDocs setup: API docs generated from docstrings
3. Usage guide: Code examples for each entity/repository
4. Type stubs: py.typed marker for type checkers
5. CI/CD: GitHub Actions (test, lint, type-check, build)
6. Package build: Build wheel + source distribution
7. Publish: Internal PyPI or GitHub Packages

**Deliverables**:
- Python package published (v1.0.0)
- MkDocs documentation site
- CI/CD pipeline working
- All 12 quality gates passed

**Evidence**:
- `pip install eva-core` working
- MkDocs site published
- CI/CD logs showing all checks passed
- Quality gates report

---

## 10. References

### Domain-Driven Design
- **DDD Patterns**: https://martinfowler.com/bliki/DomainDrivenDesign.html
- **Aggregate Pattern**: https://martinfowler.com/bliki/DDD_Aggregate.html
- **Repository Pattern**: https://martinfowler.com/eaaCatalog/repository.html
- **Domain Events**: https://martinfowler.com/eaaDev/DomainEvent.html

### Reference Implementations
- **OpenWebUI Models**: `OpenWebUI/backend/open_webui/models/` (User, Chat, File, Knowledge)
- **Pydantic Patterns**: https://docs.pydantic.dev/latest/

### EVA Orchestrator Docs
- **P02 Domain Core Requirement**: `archive/2025-11-25-intake/eva-2.0-raw/EVA-2.0/intake/P02-REQ-PREQ-DOMAIN-CORE.md`
- **eva-core Brief**: `docs/EVA-2.0/ESDC/eva2_fastlane_repo_v5_full/eva2_fastlane_repo_v5_full/copilot_briefs/eva-core.md`

### Python Libraries
- **Pydantic**: https://docs.pydantic.dev/latest/
- **pytest**: https://docs.pytest.org/en/stable/
- **Hypothesis**: https://hypothesis.readthedocs.io/en/latest/
- **mypy**: https://mypy.readthedocs.io/en/stable/
- **ruff**: https://docs.astral.sh/ruff/

---

## 11. Autonomous Implementation Model

### Context Engineering Principles

This specification follows the **Three Concepts Pattern**:

1. **Context Engineering**: Complete specification (no gaps), reference implementations analyzed (OpenWebUI models), DDD patterns documented
2. **Complete SDLC**: TDD (property-based testing with Hypothesis), type-safe (mypy strict), CI/CD (GitHub Actions), documentation (MkDocs)
3. **Execution Evidence Rule**: All deliverables must include evidence (test reports, type-check output, package installation proof, API docs)

### Implementation Approach

Marco will **NOT** be available for incremental approvals during the 6-week implementation. The agent must:

1. **Follow Requirements TO THE LETTER**: No shortcuts, no approximations, no "close enough"
2. **Use Reference Implementations**: OpenWebUI model patterns (SQLAlchemy + Pydantic)
3. **Apply All 12 Quality Gates**: 100% coverage, 100% type safety, Hypothesis property tests, packaging
4. **Test Continuously**: TDD approach (write tests first), property-based testing (Hypothesis), run tests after every change
5. **Document Everything**: Docstrings for all public APIs, usage examples, MkDocs generated site
6. **Generate Evidence**: Test reports, type-check output, package build logs, API docs screenshots

### Binary Final Review

After 6 weeks, Marco will perform a **binary review**:

- ✅ **All 12 quality gates PASS** → Ship to production (publish package)
- ❌ **Any gate FAILS** → List specific failures, agent fixes, resubmit for review

There is NO partial credit. All gates must pass.

### Success Criteria

**IF** this specification is followed completely **AND** all reference patterns are applied **AND** all 12 quality gates pass **THEN** eva-core will be production-ready without Marco's incremental involvement.

This is the **proven model from EVA-API and EVA-AUTH** (comprehensive spec → autonomous implementation → all gates passed).

---

## 12. Next Steps

1. **Marco Opens eva-core Workspace**:
   ```powershell
   cd "C:\Users\marco\Documents\_AI Dev\EVA Suite"
   code eva-core
   ```

2. **Run Startup Script**:
   ```powershell
   .\_MARCO-use-this-to-tell_copilot-to-read-repo-specific-instructions.ps1
   ```

3. **Copy Output to Copilot**:
   - Copy green text (5 bullet points)
   - Paste as FIRST message to GitHub Copilot
   - Wait for Copilot to confirm it read `docs/SPECIFICATION.md`

4. **Give Task**:
   ```
   Implement Phase 1: Core Entities (User, Tenant, Space, Document, Query, Conversation, value objects).
   Follow specification TO THE LETTER.
   Use OpenWebUI model patterns (SQLAlchemy + Pydantic).
   Use Hypothesis for property-based testing (1000+ invalid inputs).
   Achieve 100% test coverage + 100% type safety (mypy strict).
   Show test report + type-check output when done.
   ```

5. **Check In Biweekly** (NOT Weekly):
   - Week 2: Phase 1 complete? (All entities defined, tests passing, mypy passing)
   - Week 4: Phase 2 complete? (Domain events, business logic, Hypothesis tests)
   - Week 5: Phase 3 complete? (Repository interfaces, mock implementations)
   - Week 6: Phase 4 complete? (Package published, MkDocs site, all gates PASSED)

6. **Final Review** (Week 7):
   - Marco validates all 12 quality gates
   - Binary decision: Ship OR Fix

---

**END OF SPECIFICATION**

This document contains ALL requirements for autonomous eva-core implementation. No additional context needed. Follow TO THE LETTER. Good luck! 🚀
