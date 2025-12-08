"""Space entity (aggregate root) - container for documents and conversations.

Example:
    >>> from eva_core.domain.entities.space import Space, SpaceVisibility
    >>> space = Space(
    ...     tenant_id="tenant-123",
    ...     name="Policy Research",
    ...     owner_id="user-456",
    ...     visibility=SpaceVisibility.PRIVATE
    ... )
"""

import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, PrivateAttr, field_validator


class SpaceVisibility(str, Enum):
    """Space visibility level."""

    PRIVATE = "private"  # Only owners can access
    SHARED = "shared"  # Owners + explicit members can access
    PUBLIC = "public"  # All users in tenant can access


class SpaceStatus(str, Enum):
    """Space status."""

    ACTIVE = "active"
    ARCHIVED = "archived"


class SpaceMember(BaseModel):
    """Member of a space with specific role.

    Attributes:
        user_id: User ID.
        role: Member role (viewer, contributor, owner).
        added_at: Timestamp when member was added.
        added_by: User ID who added this member.
    """

    user_id: str
    role: str = "viewer"  # viewer, contributor, owner
    added_at: datetime = Field(default_factory=datetime.utcnow)
    added_by: str  # User ID who added this member


class Space(BaseModel):
    """Space entity (aggregate root for documents + conversations).

    Container for documents and conversations (like a project workspace).

    Attributes:
        id: Unique identifier.
        tenant_id: Tenant isolation.
        name: Space name.
        description: Space description (optional).
        visibility: Access level (private, shared, public).
        status: Space status (active, archived).
        owner_id: Primary owner (user ID).
        members: Space members.
        document_count: Number of documents.
        conversation_count: Number of conversations.
        total_size_bytes: Total size in bytes.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
        last_activity_at: Last activity timestamp.
        tags: Space tags.
    """

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tenant_id: str  # Tenant isolation

    # Profile
    name: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    visibility: SpaceVisibility = SpaceVisibility.PRIVATE
    status: SpaceStatus = SpaceStatus.ACTIVE

    # Access Control
    owner_id: str  # Primary owner (user ID)
    members: list[SpaceMember] = Field(default_factory=list)

    # Content Metadata
    document_count: int = 0
    conversation_count: int = 0
    total_size_bytes: int = 0

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    last_activity_at: datetime = Field(default_factory=datetime.utcnow)

    # Configuration
    tags: list[str] = Field(default_factory=list)

    # Domain Events (not persisted)
    _events: list[Any] = PrivateAttr(default_factory=list)

    @field_validator("members")
    @classmethod
    def validate_members(cls, v: list[SpaceMember]) -> list[SpaceMember]:
        """Ensure no duplicate members.

        Args:
            v: List of space members.

        Returns:
            Validated list of members.

        Raises:
            ValueError: If duplicate members exist.
        """
        user_ids = [m.user_id for m in v]
        if len(user_ids) != len(set(user_ids)):
            raise ValueError("Duplicate members not allowed")
        return v

    def has_member(self, user_id: str) -> bool:
        """Check if user is a member of this space.

        Args:
            user_id: User ID to check.

        Returns:
            True if user is owner or member, False otherwise.
        """
        return user_id == self.owner_id or any(m.user_id == user_id for m in self.members)

    def get_member_role(self, user_id: str) -> str | None:
        """Get user's role in this space.

        Args:
            user_id: User ID to check.

        Returns:
            Role string (owner, contributor, viewer) or None if not a member.
        """
        if user_id == self.owner_id:
            return "owner"
        for member in self.members:
            if member.user_id == user_id:
                return member.role
        return None

    def can_add_document(self, user_id: str) -> bool:
        """Check if user can add documents to this space.

        Args:
            user_id: User ID to check.

        Returns:
            True if user has owner or contributor role, False otherwise.
        """
        role = self.get_member_role(user_id)
        return role in ["owner", "contributor"]

    def add_document(self, document_id: str, size_bytes: int) -> None:
        """Add document to space (business logic).

        Args:
            document_id: Document ID being added.
            size_bytes: Size of document in bytes.

        Side Effects:
            - Increments document_count
            - Adds size_bytes to total_size_bytes
            - Updates last_activity_at and updated_at
        """
        self.document_count += 1
        self.total_size_bytes += size_bytes
        self.last_activity_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)

    def emit_space_created(self) -> None:
        """Emit SpaceCreated event (for event sourcing/integration)."""
        from eva_core.domain.events.space_events import SpaceCreated

        event = SpaceCreated(
            space_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            space_name=self.name,
            owner_id=self.owner_id,
            visibility=self.visibility.value,
        )
        self._events.append(event)

    def emit_document_added(
        self,
        document_id: str,
        document_name: str,
        document_type: str,
        size_bytes: int,
        uploaded_by: str,
    ) -> None:
        """Emit DocumentAdded event."""
        from eva_core.domain.events.space_events import DocumentAdded

        event = DocumentAdded(
            space_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            document_id=document_id,
            document_name=document_name,
            document_type=document_type,
            size_bytes=size_bytes,
            uploaded_by=uploaded_by,
        )
        self._events.append(event)

    def emit_member_added(self, user_id: str, role: str, added_by: str) -> None:
        """Emit MemberAdded event."""
        from eva_core.domain.events.space_events import MemberAdded

        event = MemberAdded(
            space_id=self.id,
            aggregate_id=self.id,
            tenant_id=self.tenant_id,
            user_id=user_id,
            role=role,
            added_by=added_by,
        )
        self._events.append(event)

    def collect_events(self) -> list[Any]:
        """Collect and clear domain events."""
        events = self._events.copy()
        self._events.clear()
        return events
