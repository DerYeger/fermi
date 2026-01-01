import { vi } from "vitest";

// Mock the router options to disable scroll behavior in tests
// This prevents "document is not defined" errors from vue-router's scrollToPosition
// which tries to access document asynchronously after navigation
vi.mock("~/router.options.ts", () => ({
	default: {
		scrollBehavior: () => undefined
	}
}));
