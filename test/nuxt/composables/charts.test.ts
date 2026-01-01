import { describe, expect, it } from "vitest";

describe("composables/charts", () => {
	describe("createVisualMap", () => {
		it("should return undefined when min is undefined, max is undefined, or min equals max", async () => {
			const { createVisualMap } = await import("~/composables/charts");
			expect(createVisualMap(undefined, 10)).toBeUndefined();
			expect(createVisualMap(0, undefined)).toBeUndefined();
			expect(createVisualMap(5, 5)).toBeUndefined();
		});

		it("should return visual map config with correct min/max and colorLightness range", async () => {
			const { createVisualMap } = await import("~/composables/charts");
			const result = createVisualMap(0, 100);
			expect(result).toBeDefined();
			expect(result!.min).toBe(0);
			expect(result!.max).toBe(100);
			expect(result!.show).toBe(false);
			expect(result!.inRange.colorLightness).toBeDefined();
			expect(result!.inRange.colorLightness).toHaveLength(2);
		});

		it("should invert lightness when invert is true", async () => {
			const { createVisualMap } = await import("~/composables/charts");
			const normal = createVisualMap(0, 100, false);
			const inverted = createVisualMap(0, 100, true);
			expect(normal!.inRange.colorLightness).not.toEqual(inverted!.inRange.colorLightness);
		});
	});
});
