# Value Objects

Value objects are immutable types that represent descriptive aspects of the domain with no conceptual identity.

## Email

Email addresses with validation and PII masking.

**Features:**
- RFC 5322 validation
- Automatic lowercasing
- PII-safe masking

**Example:**
```python
from eva_core.domain.value_objects.email import Email

email = Email(value="alice.smith@example.com")
print(email.value)  # "alice.smith@example.com"
print(email.mask())  # "a****.s****@e******.com"
```

## PhoneNumber

North American phone numbers with validation and masking.

**Features:**
- 10-digit validation
- Format normalization
- Last 5 digits masking

**Example:**
```python
from eva_core.domain.value_objects.phone_number import PhoneNumber

phone = PhoneNumber(value="555-123-4567")
print(phone.value)  # "5551234567"
print(phone.mask())  # "*****34567"
```

## SIN (Social Insurance Number)

Canadian Social Insurance Numbers with Luhn checksum validation.

**Features:**
- 9-digit validation
- Luhn algorithm checksum
- Last 3 digits masking

**Example:**
```python
from eva_core.domain.value_objects.sin import SIN

sin = SIN(value="046-454-286")
print(sin.value)  # "046454286"
print(sin.mask())  # "******286"
```

## Immutability

Value objects are immutable by design:

```python
email = Email(value="alice@example.com")
# Cannot modify
# email.value = "bob@example.com"  # Raises error
```

## Equality

Value objects compare by value, not identity:

```python
email1 = Email(value="alice@example.com")
email2 = Email(value="alice@example.com")
assert email1 == email2  # True - same value
assert email1 is not email2  # True - different objects
```

## PII Masking

All value objects provide masking for privacy:

```python
user = User(
    email="alice@example.com",
    name="Alice Smith",
    # ...
)

masked = user.mask_pii()
print(masked["email"])  # "a****@e******.com"
print(masked["name"])   # "A**** S****"
```

## See Also

- [Entities](entities.md)
- [API Reference](../api/value-objects.md)
