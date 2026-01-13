# AGENTS.md

- As the last step, always lint and typecheck the code to ensure it adheres to project standards.

## Commands

This project uses Bun as the runtime environment and Turborepo for running tasks.

- Use `bun run dev` to start the development server.
- Use `bun run build` to create a production build.
- Use `bun run lint` to check for linting issues.
- Use `bun run test run` to run the test suite and `bun run test run FILENAME` to run a specific test file.
- Use `bun run typecheck` to perform type checking.

## Testing Guidelines

- Never assert `component.html()` or `component.text()` to include hardcoded values.
- Do not create tests with a single `expect` statement, merge them instead.
- Never add redundant or duplicate tests.
- Cover all edge cases, including error states and boundary conditions.
- Tests are idempotent by configuration. Manual resets of mocks are redundant.
- Shallow mount components if possible. Otherwise, auto-stub child components. Assert the interactions with stubbed components through their props and emitted events. If auto-stubbing is also not possible, create a reusable stub in `test/nuxt/stubs.ts`.
- Introduce constants for repeated values in tests. Collect them in `test/data.ts` if they are shared across multiple test files.
- Always update related tests when modifying code.
- Always add tests for new features or bug fixes.
