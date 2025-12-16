# EVA Core

[![CI](https://github.com/MarcoPolo483/eva-core/workflows/CI/badge.svg)](https://github.com/MarcoPolo483/eva-core/actions)
[![codecov](https://codecov.io/gh/MarcoPolo483/eva-core/branch/master/graph/badge.svg)](https://codecov.io/gh/MarcoPolo483/eva-core)
[![PyPI version](https://badge.fury.io/py/eva-core.svg)](https://badge.fury.io/py/eva-core)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Domain models and business logic for EVA Suite** - Production-ready entities, value objects, domain events, and repository patterns for building enterprise RAG applications.

## ✨ Features

- **🏗️ 7 Core Entities**: User, Tenant, Space, Document, Query, Conversation with full Pydantic validation
- **💎 3 Value Objects**: Email, PhoneNumber, SIN with PII masking
- **📢 6 Domain Events**: Space and Query lifecycle events
- **🗄️ Repository Pattern**: Abstract interfaces with in-memory test implementations
- **🔒 Type Safety**: 100% mypy strict compliance
- **✅ Test Coverage**: 100% coverage with 157+ tests
- **🏢 Multi-Tenancy**: Built-in tenant isolation and access control
- **📖 Full Documentation**: Complete API reference and usage guides

## 🚀 Quick Start

### Installation

```bash
pip install eva-core
```

### Basic Usage

```python
from eva_core.domain.entities.tenant import Tenant
from eva_core.domain.entities.user import User, UserRole
from eva_core.domain.entities.space import Space
from eva_core.domain.entities.document import Document

# Create a tenant
tenant = Tenant(
    name="Acme Corp",
    slug="acme-corp",
    created_by="admin"
)

# Create a user
user = User(
    tenant_id=tenant.id,
    email="alice@acme.com",
    name="Alice Smith",
    auth_provider="entra_id",
    auth_sub="auth0|12345",
    role=UserRole.ADMIN,
    created_by="system"
)

# Create a space
space = Space(
    tenant_id=tenant.id,
    name="Engineering Docs",
    owner_id=user.id
)

# Add a document
document = Document(
    tenant_id=tenant.id,
    space_id=space.id,
    filename="api-spec.pdf",
    content_type="application/pdf",
    content_hash="sha256:abc123...",
    blob_url="https://storage.example.com/docs/api-spec.pdf",
    size_bytes=1024000,
    uploaded_by=user.id
)
```

### Using Repositories

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
users = await user_repo.list_by_tenant(tenant.id, skip=0, limit=10)
```

## 📚 Documentation

Full documentation is available at [eva-core.readthedocs.io](https://eva-core.readthedocs.io) (or build locally with `mkdocs serve`).

- **[Installation Guide](docs/getting-started/installation.md)**
- **[Quick Start Tutorial](docs/getting-started/quick-start.md)**
- **[Usage Guide](docs/usage/entities.md)**
- **[API Reference](docs/api/entities.md)**
- **[Contributing](docs/development/contributing.md)**

## 🏗️ Architecture

EVA Core follows **Domain-Driven Design** principles:

```
src/eva_core/domain/
├── entities/           # Core business entities (User, Tenant, Space, etc.)
├── value_objects/      # Immutable value types (Email, PhoneNumber, SIN)
├── events/            # Domain event system (SpaceCreated, QueryCompleted, etc.)
└── repositories/      # Data access interfaces and in-memory implementations
```

### Core Entities

- **Tenant**: Multi-tenant organization with quota management
- **User**: Authenticated users with RBAC (admin, member, viewer)
- **Space**: Document container with member-based access control
- **Document**: Uploaded files with indexing lifecycle
- **Query**: RAG queries with citations and metrics
- **Conversation**: Query threads for contextual conversations

### Value Objects

- **Email**: RFC 5322 validation with PII masking (`a****@e******.com`)
- **PhoneNumber**: 10-digit North American numbers with masking (`*****34567`)
- **SIN**: Canadian SIN with Luhn checksum validation and masking (`******286`)

### Domain Events

- **SpaceCreated**, **DocumentAdded**, **MemberAdded**
- **QueryExecuted**, **QueryCompleted**, **QueryFailed**

## 🧪 Development

### Setup

```bash
# Clone repository
git clone https://github.com/MarcoPolo483/eva-core.git
cd eva-core

# Install dependencies
poetry install

# Install pre-commit hooks
poetry run pre-commit install
```

### Testing

```bash
# Run all tests
poetry run pytest

# With coverage
poetry run pytest --cov=eva_core --cov-report=html

# Type checking
poetry run mypy src/

# Linting
poetry run ruff check src/ tests/
```

### Quality Gates

EVA Core maintains strict quality standards:

- ✅ 100% test coverage (157+ tests)
- ✅ 100% mypy strict compliance
- ✅ Ruff linting (zero violations)
- ✅ Hypothesis property-based tests
- ✅ Pre-commit hooks
- ✅ CI/CD with GitHub Actions

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/development/contributing.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Ensure all checks pass (`pytest`, `mypy`, `ruff`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Built with [Pydantic](https://docs.pydantic.dev/) for data validation
- Inspired by Domain-Driven Design principles
- Part of the [EVA Suite](https://github.com/MarcoPolo483) ecosystem

---

**Made with ❤️ for the Government of Canada**

<!-- Phase 3 enforcement system test -->

<!-- Phase 3 enforcement system test -->
