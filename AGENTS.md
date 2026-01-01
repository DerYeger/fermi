# Fermi

## Testing

- Use `bun run test` for running unit tests.
- Use `bun run test FILENAME` to run a specific test file.
- Do not implement tests that expect `component.html()` or `component.text()` to include hardcoded values.
- Merge tests that have a single `expect` statement into other relevant tests to maintain conciseness.
- Always add tests for all paths through a component to ensure comprehensive coverage. For example, test both the confirmation and cancellation paths in a confirmation dialog component.
