"""EVA Core - Domain models and business logic for EVA Suite.

This package provides:
- Domain Entities: User, Tenant, Space, Document, Query, Conversation
- Value Objects: Email, PhoneNumber, SIN (with PII masking)
- Domain Events: SpaceCreated, DocumentAdded, QueryExecuted, etc.
- Repository Interfaces: Abstract data access patterns

Example:
    >>> from eva_core.domain.entities.user import User, UserRole
    >>> user = User(
    ...     tenant_id="tenant-123",
    ...     email="john.doe@canada.ca",
    ...     name="John Doe",
    ...     role=UserRole.ANALYST,
    ...     auth_provider="entra_id",
    ...     auth_sub="sub-123",
    ...     created_by="admin-456"
    ... )
    >>> user.role
    <UserRole.ANALYST: 'analyst'>
"""

__version__ = "1.0.0"
__author__ = "Marco Presta"
__license__ = "MIT"

# Export commonly used entities
from eva_core.domain.entities.conversation import Conversation, ConversationStatus
from eva_core.domain.entities.document import Document, DocumentStatus, DocumentType
from eva_core.domain.entities.query import Citation, Query, QueryStatus
from eva_core.domain.entities.space import Space, SpaceMember, SpaceStatus, SpaceVisibility
from eva_core.domain.entities.tenant import Tenant, TenantQuotas, TenantStatus
from eva_core.domain.entities.user import User, UserPreferences, UserRole, UserStatus
from eva_core.domain.value_objects.email import Email
from eva_core.domain.value_objects.phone_number import PhoneNumber
from eva_core.domain.value_objects.sin import SIN

__all__ = [
    "SIN",
    "Citation",
    # Conversation
    "Conversation",
    "ConversationStatus",
    # Document
    "Document",
    "DocumentStatus",
    "DocumentType",
    # Value Objects
    "Email",
    "PhoneNumber",
    # Query
    "Query",
    "QueryStatus",
    # Space
    "Space",
    "SpaceMember",
    "SpaceStatus",
    "SpaceVisibility",
    # Tenant
    "Tenant",
    "TenantQuotas",
    "TenantStatus",
    # User
    "User",
    "UserPreferences",
    "UserRole",
    "UserStatus",
    "__author__",
    "__license__",
    # Version
    "__version__",
]
