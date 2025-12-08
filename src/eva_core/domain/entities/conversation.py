"""Conversation entity - groups related queries into a conversation thread.

Example:
    >>> from eva_core.domain.entities.conversation import Conversation
    >>> conv = Conversation(
    ...     space_id="space-123",
    ...     tenant_id="tenant-456",
    ...     title="Remote Work Policy Discussion",
    ...     user_id="user-789"
    ... )
"""

import uuid
from datetime import UTC, datetime
from enum import Enum

from pydantic import BaseModel, Field


class ConversationStatus(str, Enum):
    """Conversation status."""

    ACTIVE = "active"
    ARCHIVED = "archived"


class Conversation(BaseModel):
    """Conversation entity (grouping of queries).

    Groups related queries into a conversation thread.

    Attributes:
        id: Unique identifier.
        space_id: Parent space ID.
        tenant_id: Tenant isolation.
        title: Conversation title.
        description: Conversation description (optional).
        status: Conversation status (active, archived).
        query_count: Number of queries in conversation.
        last_query_at: Last query timestamp (optional).
        user_id: Owner user ID.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
    """

    # Identity
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    space_id: str
    tenant_id: str

    # Content
    title: str = Field(min_length=1, max_length=200)
    description: str | None = Field(None, max_length=1000)
    status: ConversationStatus = ConversationStatus.ACTIVE

    # Queries
    query_count: int = 0
    last_query_at: datetime | None = None

    # Audit
    user_id: str  # Owner
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    def add_query(self, query_id: str) -> None:
        """Add query to conversation.

        Args:
            query_id: Query ID being added.

        Side Effects:
            - Increments query_count
            - Sets last_query_at to current time
            - Updates updated_at
        """
        self.query_count += 1
        self.last_query_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)
