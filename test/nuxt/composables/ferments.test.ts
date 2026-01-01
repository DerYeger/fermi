import { describe, expect, it } from "vitest";

describe("composables/ferments", () => {
	describe("pREDEFINED_UNITS", () => {
		it("should have metric, imperial and other units", async () => {
			const { PREDEFINED_UNITS } = await import("~/composables/ferments");
			expect(PREDEFINED_UNITS.Metric).toContain("g");
			expect(PREDEFINED_UNITS.Metric).toContain("kg");
			expect(PREDEFINED_UNITS.Metric).toContain("ml");
			expect(PREDEFINED_UNITS.Metric).toContain("l");
			expect(PREDEFINED_UNITS.Imperial).toContain("fl oz");
			expect(PREDEFINED_UNITS.Imperial).toContain("lb");
			expect(PREDEFINED_UNITS.Imperial).toContain("oz");
			expect(PREDEFINED_UNITS.Other).toContain("cups");
			expect(PREDEFINED_UNITS.Other).toContain("pieces");
			expect(PREDEFINED_UNITS.Other).toContain("slices");
			expect(PREDEFINED_UNITS.Other).toContain("tbsp");
			expect(PREDEFINED_UNITS.Other).toContain("tsp");
		});
	});

	describe("formatQuantity", () => {
		it("should format quantity with various units", async () => {
			const { formatQuantity } = await import("~/composables/ferments");
			expect(formatQuantity(500, "g")).toContain("500");
			expect(formatQuantity(2.5, "kg")).toContain("2");
			const customResult = formatQuantity(3, "heads");
			expect(customResult).toContain("3");
			expect(customResult).toContain("heads");
			const piecesResult = formatQuantity(5, "pieces");
			expect(piecesResult).toContain("5");
			expect(piecesResult).toContain("pieces");
			expect(formatQuantity(1.5, "l")).toContain("1");
		});
	});
});
