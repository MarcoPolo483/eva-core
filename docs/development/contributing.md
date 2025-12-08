# Contributing

Thank you for considering contributing to EVA Core!

## Development Setup

1. **Clone the repository**

```bash
git clone https://github.com/MarcoPolo483/eva-core.git
cd eva-core
```

2. **Install dependencies**

```bash
poetry install
```

3. **Install pre-commit hooks**

```bash
poetry run pre-commit install
```

## Development Workflow

### 1. Create a branch

```bash
git checkout -b feature/my-feature
```

### 2. Make changes

Follow the project structure:

```
src/eva_core/domain/
├── entities/       # Domain entities
├── value_objects/  # Immutable value types
├── events/         # Domain events
└── repositories/   # Data access interfaces
```

### 3. Write tests

- Every new feature needs tests
- Maintain 100% coverage
- Use pytest for unit tests
- Use Hypothesis for property tests

```bash
pytest tests/
```

### 4. Type check

```bash
mypy src/
```

### 5. Lint

```bash
ruff check src/ tests/
```

### 6. Format

```bash
ruff format src/ tests/
```

### 7. Run all checks

```bash
pre-commit run --all-files
```

## Code Standards

### Type Hints

All code must have full type hints:

```python
def process_user(user: User, tenant_id: str) -> dict[str, Any]:
    """Process user data."""
    ...
```

### Docstrings

Use Google-style docstrings:

```python
def create_space(name: str, owner_id: str) -> Space:
    """Create a new space.
    
    Args:
        name: Space display name
        owner_id: ID of the space owner
        
    Returns:
        The newly created Space entity
        
    Raises:
        ValidationError: If name is invalid
    """
    ...
```

### Testing

- 100% coverage required
- Test edge cases
- Use descriptive test names

```python
def test_user_cannot_access_space_in_different_tenant():
    """Test tenant isolation in access control."""
    ...
```

## Pull Request Process

1. **Update tests** - Add tests for new features
2. **Update docs** - Update relevant documentation
3. **Run checks** - Ensure all tests and lints pass
4. **Write changelog** - Describe your changes
5. **Submit PR** - Create pull request with clear description

### PR Checklist

- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] Type hints added
- [ ] All tests pass
- [ ] Coverage at 100%
- [ ] mypy passes
- [ ] ruff passes
- [ ] Changelog updated

## Code Review

- Be respectful and constructive
- Focus on code quality and design
- Suggest improvements, don't demand
- Explain your reasoning

## Questions?

- Open an issue for bugs
- Start a discussion for features
- Ask in pull requests for clarification

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
