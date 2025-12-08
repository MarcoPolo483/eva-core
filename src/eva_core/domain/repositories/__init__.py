"""Repository interfaces for EVA Core domain."""

from eva_core.domain.repositories.base import Repository
from eva_core.domain.repositories.document_repository import DocumentRepository
from eva_core.domain.repositories.query_repository import QueryRepository
from eva_core.domain.repositories.space_repository import SpaceRepository
from eva_core.domain.repositories.tenant_repository import TenantRepository
from eva_core.domain.repositories.user_repository import UserRepository

__all__ = [
    "DocumentRepository",
    "QueryRepository",
    "Repository",
    "SpaceRepository",
    "TenantRepository",
    "UserRepository",
]
