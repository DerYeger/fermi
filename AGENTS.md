# AGENTS.md

## Commands

This project uses Bun as the runtime environment and Turborepo for running tasks.

- Use `bun run dev` to start the development server.
- Use `bun run build` to create a production build.
- Use `bun run lint` to check for linting issues.
- Use `bun run test run` to run the test suite and `bun run test run FILENAME` to run a specific test file.

## Testing Guidelines

- Do not implement tests that expect `component.html()` or `component.text()` to include hardcoded values.
- Merge tests that have a single `expect` statement into other relevant tests to maintain conciseness.
- Always add tests for all paths through a component to ensure comprehensive coverage. For example, test both the confirmation and cancellation paths in a confirmation dialog component.
