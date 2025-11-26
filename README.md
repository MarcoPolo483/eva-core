# eva-core

Shared TypeScript domain types and orchestrator helpers for EVA 2.0 services.

## Fastlane demo scope

- `src/domain/app.ts` exposes the canonical interfaces for `ProjectConfig`, `Layout`,
  `ScreenTemplate`, `Asset`, and the RAG request/response contracts used by
  `eva-api`, `eva-ui`, and the mobile client. `src/domain/app.schema.ts` adds the
  runtime validators (Zod) for those shapes.
- `src/domain/plan.ts` defines a lightweight execution plan abstraction for
	orchestrating EVA agent steps.
- `src/util/result.ts` provides a tiny `Result` helper that the rest of the
	repos can depend on without pulling an external library.

Run `npm run build` to emit the distributable package consumed by the other EVA
repos.