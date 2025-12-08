# Installation

## Requirements

- Python 3.11 or higher
- pip or Poetry package manager

## Install from PyPI

```bash
pip install eva-core
```

## Install from source

```bash
git clone https://github.com/MarcoPolo483/eva-core.git
cd eva-core
pip install -e .
```

## Using Poetry

```bash
poetry add eva-core
```

## Verify Installation

```python
from eva_core import User, Tenant, Space

print("EVA Core installed successfully!")
```

## Development Installation

For contributing to EVA Core:

```bash
git clone https://github.com/MarcoPolo483/eva-core.git
cd eva-core
poetry install
poetry run pre-commit install
```

This installs all development dependencies including:

- pytest for testing
- mypy for type checking
- ruff for linting
- mkdocs for documentation
