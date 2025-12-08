"""Document entity - represents a file uploaded to a space.

Example:
    >>> from eva_core.domain.entities.document import Document, DocumentType
    >>> doc = Document(
    ...     space_id="space-123",
    ...     tenant_id="tenant-456",
    ...     filename="policy.pdf",
    ...     size_bytes=1024000,
    ...     content_hash="abc123...",
    ...     blob_url="https://storage.example.com/doc1",
    ...     document_type=DocumentType.POLICY,
    ...     uploaded_by="user-789"
    ... )
"""

import hashlib
import uuid
from datetime import UTC, datetime
from enum import Enum
from typing import Any

from pydantic import BaseModel, Field, field_validator


class DocumentStatus(str, Enum):
    """Document processing status."""

    PENDING = "pending"  # Uploaded, not yet indexed
    PROCESSING = "processing"  # Being chunked/embedded
    INDEXED = "indexed"  # Ready for queries
    FAILED = "failed"  # Processing failed
    DELETED = "deleted"  # Soft-deleted


class DocumentType(str, Enum):
    """Document classification type."""

    POLICY = "policy"
    JURISPRUDENCE = "jurisprudence"
    GUIDANCE = "guidance"
    FAQ = "faq"
    OTHER = "other"


class DocumentMetadata(BaseModel):
    """Document metadata (extracted during indexing).

    Attributes:
        author: Document author (optional).
        publication_date: Publication date (optional).
        effective_date: Effective date (optional).
        language: Document language (en, fr).
        page_count: Number of pages (optional).
        tags: Document tags.
        custom_fields: Custom metadata fields.
    """

    author: str | None = None
    publication_date: datetime | None = None
    effective_date: datetime | None = None
    language: str = "en"  # en, fr
    page_count: int | None = None
    tags: list[str] = Field(default_factory=list)
    custom_fields: dict[str, Any] = Field(default_factory=dict)


class Document(BaseModel):
    """Document entity (owned by a Space).

    Represents a file uploaded to a space (policy doc, jurisprudence, guide).

    Attributes:
        id: Unique identifier.
        space_id: Parent space ID.
        tenant_id: Tenant isolation.
        filename: Original filename.
        content_type: MIME type.
        size_bytes: File size in bytes.
        content_hash: SHA-256 hash (for deduplication).
        blob_url: Azure Blob Storage URL.
        document_type: Document classification.
        status: Processing status.
        metadata: Document metadata.
        chunk_count: Number of chunks created during indexing.
        indexed_at: Indexing completion timestamp (optional).
        uploaded_by: User ID who uploaded.
        created_at: Creation timestamp.
        updated_at: Last update timestamp.
    """

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
    indexed_at: datetime | None = None

    # Access
    uploaded_by: str  # User ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @staticmethod
    def compute_content_hash(content: bytes) -> str:
        """Compute SHA-256 hash of content (for deduplication).

        Args:
            content: File content as bytes.

        Returns:
            SHA-256 hash as hex string.

        Example:
            >>> Document.compute_content_hash(b"test content")
            '6ae8a75555209fd6c44157c0aed8016e763ff435a19cf186f76863140143ff72'
        """
        return hashlib.sha256(content).hexdigest()

    @field_validator("filename")
    @classmethod
    def validate_filename(cls, v: str) -> str:
        """Ensure filename has valid extension.

        Args:
            v: Filename string.

        Returns:
            Validated filename.

        Raises:
            ValueError: If filename extension is not allowed.
        """
        allowed_extensions = [".pdf", ".docx", ".txt", ".md"]
        if not any(v.lower().endswith(ext) for ext in allowed_extensions):
            raise ValueError(f"Invalid file extension. Allowed: {allowed_extensions}")
        return v

    def is_duplicate(self, other_hash: str) -> bool:
        """Check if document is duplicate based on content hash.

        Args:
            other_hash: Content hash to compare against.

        Returns:
            True if hashes match, False otherwise.
        """
        return self.content_hash == other_hash

    def mark_as_indexed(self, chunk_count: int) -> None:
        """Mark document as successfully indexed.

        Args:
            chunk_count: Number of chunks created.

        Side Effects:
            - Sets status to INDEXED
            - Sets chunk_count
            - Sets indexed_at to current time
            - Updates updated_at
        """
        self.status = DocumentStatus.INDEXED
        self.chunk_count = chunk_count
        self.indexed_at = datetime.now(UTC)
        self.updated_at = datetime.now(UTC)
