import { describe, expect, it, vi } from "vitest";
import { createId } from "~/composables/id";

vi.mock("nanoid/non-secure", () => ({
	nanoid: vi.fn(() => "mocked-id-123")
}));

describe("composables/id", () => {
	describe("createId", () => {
		it("should generate a string id using nanoid", () => {
			const id = createId();
			expect(id).toBe("mocked-id-123");
			expect(typeof id).toBe("string");
		});
	});
});
