# EVA Core

Domain models and business logic for EVA Suite.

## Overview

EVA Core provides production-ready domain entities with strict validation, domain events, and repository patterns for building enterprise RAG applications.

## Features

- **7 Core Entities**: User, Tenant, Space, Document, Query, Conversation with full Pydantic validation
- **3 Value Objects**: Email, PhoneNumber, SIN with PII masking
- **6 Domain Events**: Space and Query lifecycle events
- **Repository Pattern**: Abstract interfaces with in-memory test implementations
- **Type Safety**: 100% mypy strict compliance
- **Test Coverage**: 100% coverage with 157+ tests
- **Multi-Tenancy**: Built-in tenant isolation and access control

## Quick Links

- [Installation Guide](getting-started/installation.md)
- [Quick Start Tutorial](getting-started/quick-start.md)
- [API Reference](api/entities.md)
- [GitHub Repository](https://github.com/MarcoPolo483/eva-core)

## Architecture

EVA Core follows Domain-Driven Design principles:

```
eva_core/
├── domain/
│   ├── entities/          # Core business entities
│   ├── value_objects/     # Immutable value types
│   ├── events/            # Domain event system
│   └── repositories/      # Data access interfaces
```

## License

MIT License - see [LICENSE](https://github.com/MarcoPolo483/eva-core/blob/master/LICENSE) for details.
