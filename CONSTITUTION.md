# Constitution

Version: 1.0.0
Ratified: 2026-03-26

## Purpose

This fork of superjson exists to improve code quality, reliability, and developer experience through automated contributions. All work must maintain backward compatibility with the upstream API.

## Principles

- **Correctness first** -- All changes must maintain or improve correctness. No regressions in serialization/deserialization behavior.
- **Simplicity** -- Prefer the simplest solution. superjson's value is in being lightweight and predictable.
- **Test coverage** -- Every behavioral change must include tests. Existing tests must never be removed or weakened.
- **Type safety** -- Leverage TypeScript's type system to catch errors at compile time.
- **Documentation** -- Public APIs and complex internal logic should be well-documented with JSDoc.
- **Backward compatible** -- The public API surface must not break. New features are additive only.

## Boundaries

These are hard vetoes. Work that violates any boundary is automatically blocked:

- Will NOT add new runtime dependencies
- Will NOT change the public API signature without a constitutional amendment
- Will NOT remove or weaken existing tests
- Will NOT drop support for any currently supported JavaScript environment
- Will NOT add telemetry, tracking, or analytics
- Will NOT modify benchmark files without explicit justification
- Will NOT introduce circular dependencies between modules

## Quality Standards

All contributions must meet these standards:

- TypeScript strict mode passes with zero errors
- All existing tests pass (vitest)
- New behavioral code has test coverage
- No eslint errors
- JSDoc on all exported functions, classes, and interfaces
- No function longer than 50 lines
- No file longer than 300 lines
- Diff size under 500 lines per task

## Roadmap

Accepted areas of work, in priority order:

1. Add JSDoc documentation to all exported symbols
2. Improve test coverage for edge cases in serialization
3. Add type annotations where inference is ambiguous
4. Fix lint issues flagged by static analysis
5. Refactor large functions (>50 lines) into smaller units
6. Add error messages that include context about what failed and why
7. Improve performance of deep object traversal
