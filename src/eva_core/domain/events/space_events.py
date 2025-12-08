"""Space-related domain events.

Events related to space lifecycle and operations.
"""

from pydantic import Field

from eva_core.domain.events.base import DomainEvent


class SpaceCreated(DomainEvent):
    """Event emitted when a new space is created.

    Attributes:
        space_id: ID of the newly created space.
        space_name: Name of the space.
        owner_id: User who created the space.
        visibility: Space visibility setting.

    Example:
        >>> event = SpaceCreated(
        ...     space_id="space-123",
        ...     aggregate_id="space-123",
        ...     tenant_id="tenant-456",
        ...     space_name="Policy Research",
        ...     owner_id="user-789",
        ...     visibility="private"
        ... )
    """

    event_type: str = Field(default="SpaceCreated", frozen=True)
    space_id: str = Field(min_length=1)
    space_name: str = Field(min_length=1, max_length=200)
    owner_id: str = Field(min_length=1)
    visibility: str = Field(min_length=1)


class DocumentAdded(DomainEvent):
    """Event emitted when a document is added to a space.

    Attributes:
        space_id: ID of the space.
        document_id: ID of the document.
        document_name: Name of the document.
        document_type: Type of document (policy, report, etc.).
        size_bytes: Document size in bytes.
        uploaded_by: User who uploaded the document.

    Example:
        >>> event = DocumentAdded(
        ...     space_id="space-123",
        ...     aggregate_id="space-123",
        ...     tenant_id="tenant-456",
        ...     document_id="doc-abc",
        ...     document_name="policy.pdf",
        ...     document_type="policy",
        ...     size_bytes=1024000,
        ...     uploaded_by="user-789"
        ... )
    """

    event_type: str = Field(default="DocumentAdded", frozen=True)
    space_id: str = Field(min_length=1)
    document_id: str = Field(min_length=1)
    document_name: str = Field(min_length=1, max_length=255)
    document_type: str = Field(min_length=1)
    size_bytes: int = Field(gt=0)
    uploaded_by: str = Field(min_length=1)


class MemberAdded(DomainEvent):
    """Event emitted when a member is added to a space.

    Attributes:
        space_id: ID of the space.
        user_id: User being added as member.
        role: Role assigned to the member.
        added_by: User who added this member.

    Example:
        >>> event = MemberAdded(
        ...     space_id="space-123",
        ...     aggregate_id="space-123",
        ...     tenant_id="tenant-456",
        ...     user_id="user-999",
        ...     role="viewer",
        ...     added_by="user-789"
        ... )
    """

    event_type: str = Field(default="MemberAdded", frozen=True)
    space_id: str = Field(min_length=1)
    user_id: str = Field(min_length=1)
    role: str = Field(min_length=1)
    added_by: str = Field(min_length=1)
