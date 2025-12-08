"""In-memory document repository for testing."""

from __future__ import annotations

import builtins

from eva_core.domain.entities.document import Document, DocumentStatus
from eva_core.domain.repositories.document_repository import DocumentRepository


class InMemoryDocumentRepository(DocumentRepository):
    """In-memory implementation of DocumentRepository for testing.

    Stores documents in a dictionary keyed by document ID.
    """

    def __init__(self) -> None:
        """Initialize empty document store."""
        self._documents: dict[str, Document] = {}

    async def get(self, id: str) -> Document | None:
        """Retrieve document by ID."""
        return self._documents.get(id)

    async def list(self, skip: int = 0, limit: int = 100) -> builtins.list[Document]:
        """List documents with pagination."""
        documents = [d for d in self._documents.values()]  # noqa: C416
        return documents[skip : skip + limit]

    async def save(self, entity: Document) -> Document:
        """Save document."""
        self._documents[entity.id] = entity
        return entity

    async def delete(self, id: str) -> bool:
        """Delete document by ID."""
        if id in self._documents:
            del self._documents[id]
            return True
        return False

    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> builtins.list[Document]:
        """List documents in space with pagination."""
        documents = [
            d
            for d in self._documents.values()
            if d.space_id == space_id and d.tenant_id == tenant_id
        ]
        return documents[skip : skip + limit]

    async def get_by_content_hash(
        self, content_hash: str, tenant_id: str
    ) -> Document | None:
        """Find document by content hash (for deduplication)."""
        for doc in self._documents.values():
            if doc.content_hash == content_hash and doc.tenant_id == tenant_id:
                return doc
        return None

    async def list_pending_indexing(
        self, tenant_id: str, limit: int = 100
    ) -> builtins.list[Document]:
        """List documents pending indexing."""
        pending = [
            d
            for d in self._documents.values()
            if d.tenant_id == tenant_id and d.status == DocumentStatus.PENDING
        ]
        return pending[:limit]
