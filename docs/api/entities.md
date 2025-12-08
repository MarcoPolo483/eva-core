# API Reference: Entities

::: eva_core.domain.entities.user
    options:
      show_root_heading: true
      members:
        - User
        - UserRole
        - UserStatus
        - UserPreferences

::: eva_core.domain.entities.tenant
    options:
      show_root_heading: true
      members:
        - Tenant
        - TenantStatus
        - TenantQuotas

::: eva_core.domain.entities.space
    options:
      show_root_heading: true
      members:
        - Space
        - SpaceMember
        - SpaceVisibility
        - SpaceStatus

::: eva_core.domain.entities.document
    options:
      show_root_heading: true
      members:
        - Document
        - DocumentStatus
        - DocumentType

::: eva_core.domain.entities.query
    options:
      show_root_heading: true
      members:
        - Query
        - Citation
        - QueryStatus

::: eva_core.domain.entities.conversation
    options:
      show_root_heading: true
      members:
        - Conversation
        - ConversationStatus
