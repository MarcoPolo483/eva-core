"""Document repository interface."""

from abc import abstractmethod

from eva_core.domain.entities.document import Document
from eva_core.domain.repositories.base import Repository


class DocumentRepository(Repository[Document]):
    """Repository for Document entity.

    Extends base repository with document-specific query methods.
    """

    @abstractmethod
    async def list_by_space(
        self, space_id: str, tenant_id: str, skip: int = 0, limit: int = 100
    ) -> list[Document]:
        """List documents in space with pagination.

        Args:
            space_id: Space ID.
            tenant_id: Tenant ID for isolation.
            skip: Number of documents to skip.
            limit: Maximum number of documents to return.

        Returns:
            List of documents in space.
        """
        ...

    @abstractmethod
    async def get_by_content_hash(
        self, content_hash: str, tenant_id: str
    ) -> Document | None:
        """Find document by content hash (for deduplication).

        Args:
            content_hash: SHA-256 content hash.
            tenant_id: Tenant ID for isolation.

        Returns:
            Document if found, None otherwise.
        """
        ...

    @abstractmethod
    async def list_pending_indexing(
        self, tenant_id: str, limit: int = 100
    ) -> list[Document]:
        """List documents pending indexing.

        Args:
            tenant_id: Tenant ID for isolation.
            limit: Maximum number of documents to return.

        Returns:
            List of documents with status UPLOADED (not yet indexed).
        """
        ...
