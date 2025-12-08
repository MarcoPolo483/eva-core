# Testing

## Overview

EVA Core has 100% test coverage with 157+ tests using pytest, Hypothesis, and pytest-asyncio.

## Running Tests

```bash
# Run all tests
pytest

# With coverage
pytest --cov=eva_core

# Specific test file
pytest tests/test_entities/test_user.py

# Specific test
pytest tests/test_entities/test_user.py::TestUser::test_user_creation_minimal
```

## Test Structure

```
tests/
├── test_entities/          # Entity tests
│   ├── test_user.py
│   ├── test_all_entities.py
│   └── ...
├── test_value_objects/     # Value object tests
├── test_domain_events.py   # Event system tests
├── test_business_rules.py  # Business logic tests
├── test_repositories.py    # Repository tests
└── test_coverage.py        # Edge case coverage
```

## Writing Tests

### Entity Tests

```python
import pytest
from eva_core.domain.entities.user import User, UserRole

def test_user_creation():
    user = User(
        tenant_id="tenant-123",
        email="test@example.com",
        name="Test User",
        auth_provider="entra_id",
        auth_sub="auth0|123",
        created_by="system"
    )
    
    assert user.email == "test@example.com"
    assert user.role == UserRole.MEMBER  # Default
```

### Async Repository Tests

```python
import pytest
from eva_core.domain.repositories.memory import InMemoryUserRepository

@pytest.mark.asyncio
async def test_user_save_and_get():
    repo = InMemoryUserRepository()
    
    user = User(...)
    await repo.save(user)
    
    retrieved = await repo.get(user.id)
    assert retrieved.id == user.id
```

### Property-Based Tests

```python
from hypothesis import given, strategies as st
from eva_core.domain.value_objects.email import Email

@given(st.emails())
def test_email_accepts_valid_emails(email: str):
    """Property test: all valid emails should be accepted."""
    email_obj = Email(value=email)
    assert "@" in email_obj.value
```

### Validation Tests

```python
import pytest
from pydantic import ValidationError
from eva_core.domain.entities.user import User

def test_user_invalid_email():
    with pytest.raises(ValidationError):
        User(
            tenant_id="tenant-123",
            email="not-an-email",  # Invalid
            name="Test",
            auth_provider="entra_id",
            auth_sub="123",
            created_by="system"
        )
```

## Test Fixtures

```python
@pytest.fixture
def tenant():
    return Tenant(
        name="Test Org",
        slug="test-org",
        created_by="admin"
    )

@pytest.fixture
def user(tenant):
    return User(
        tenant_id=tenant.id,
        email="test@example.com",
        name="Test User",
        auth_provider="entra_id",
        auth_sub="auth0|123",
        created_by="system"
    )
```

## Coverage Requirements

EVA Core maintains 100% test coverage:

```bash
# Fail if coverage < 100%
pytest --cov=eva_core --cov-fail-under=100
```

## Type Checking

```bash
# Run mypy strict
mypy src/
```

## Linting

```bash
# Run ruff
ruff check src/ tests/

# Auto-fix issues
ruff check --fix src/ tests/
```

## Pre-commit Hooks

```bash
# Install hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

## Continuous Integration

Tests run automatically on:
- Every push
- Every pull request
- Using GitHub Actions

See `.github/workflows/ci.yml` for the full CI pipeline.

## Performance Tests

```bash
# Run benchmark tests
pytest tests/test_performance.py --benchmark-only
```

## See Also

- [Contributing](contributing.md)
- [API Reference](../api/entities.md)
