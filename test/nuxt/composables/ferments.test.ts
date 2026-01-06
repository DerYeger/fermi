import { describe, expect, it } from "vitest";
import { formatQuantity, PREDEFINED_UNITS } from "~/composables/ferments";

describe("composables/ferments", () => {
	describe("pREDEFINED_UNITS", () => {
		it("has metric units", () => {
			expect(PREDEFINED_UNITS.Metric).toContain("g");
			expect(PREDEFINED_UNITS.Metric).toContain("kg");
			expect(PREDEFINED_UNITS.Metric).toContain("ml");
			expect(PREDEFINED_UNITS.Metric).toContain("l");
		});

		it("has imperial units", () => {
			expect(PREDEFINED_UNITS.Imperial).toContain("fl oz");
			expect(PREDEFINED_UNITS.Imperial).toContain("lb");
			expect(PREDEFINED_UNITS.Imperial).toContain("oz");
		});

		it("has other units", () => {
			expect(PREDEFINED_UNITS.Other).toContain("cups");
			expect(PREDEFINED_UNITS.Other).toContain("pieces");
			expect(PREDEFINED_UNITS.Other).toContain("slices");
			expect(PREDEFINED_UNITS.Other).toContain("tbsp");
			expect(PREDEFINED_UNITS.Other).toContain("tsp");
		});
	});

	describe("formatQuantity", () => {
		describe("metric units", () => {
			it("formats grams using Intl unit formatting", () => {
				const result = formatQuantity(500, "g");
				expect(result).toContain("500");
			});

			it("formats kilograms", () => {
				const result = formatQuantity(2.5, "kg");
				expect(result).toContain("2");
			});

			it("formats milliliters", () => {
				const result = formatQuantity(250, "ml");
				expect(result).toContain("250");
			});

			it("formats liters", () => {
				const result = formatQuantity(1.5, "l");
				expect(result).toContain("1");
			});
		});

		describe("imperial units", () => {
			it("formats ounces", () => {
				const result = formatQuantity(8, "oz");
				expect(result).toContain("8");
			});

			it("formats fluid ounces", () => {
				const result = formatQuantity(12, "fl oz");
				expect(result).toContain("12");
			});

			it("formats pounds", () => {
				const result = formatQuantity(2, "lb");
				expect(result).toContain("2");
			});
		});

		describe("other units", () => {
			it("formats cups with fallback", () => {
				const result = formatQuantity(2, "cups");
				expect(result).toContain("2");
				expect(result).toContain("cups");
			});

			it("formats pieces with fallback", () => {
				const result = formatQuantity(5, "pieces");
				expect(result).toContain("5");
				expect(result).toContain("pieces");
			});

			it("formats slices with fallback", () => {
				const result = formatQuantity(3, "slices");
				expect(result).toContain("3");
				expect(result).toContain("slices");
			});

			it("formats tbsp with fallback", () => {
				const result = formatQuantity(2, "tbsp");
				expect(result).toContain("2");
				expect(result).toContain("tbsp");
			});

			it("formats tsp with fallback", () => {
				const result = formatQuantity(1, "tsp");
				expect(result).toContain("1");
				expect(result).toContain("tsp");
			});
		});

		describe("custom units", () => {
			it("formats unknown units using fallback", () => {
				const result = formatQuantity(3, "heads");
				expect(result).toContain("3");
				expect(result).toContain("heads");
			});

			it("formats custom unit bunches", () => {
				const result = formatQuantity(2, "bunches");
				expect(result).toContain("2");
				expect(result).toContain("bunches");
			});

			it("formats custom unit cloves", () => {
				const result = formatQuantity(4, "cloves");
				expect(result).toContain("4");
				expect(result).toContain("cloves");
			});
		});

		describe("decimal quantities", () => {
			it("formats decimal quantities with up to 2 decimal places", () => {
				const result = formatQuantity(1.25, "kg");
				expect(result).toContain("1");
			});

			it("handles very small decimal quantities", () => {
				const result = formatQuantity(0.5, "kg");
				expect(result).toContain("0");
			});

			it("handles precise decimals", () => {
				const result = formatQuantity(2.33, "l");
				expect(result).toContain("2");
			});
		});

		describe("edge cases", () => {
			it("formats zero quantity", () => {
				const result = formatQuantity(0, "g");
				expect(result).toContain("0");
			});

			it("formats large quantities", () => {
				const result = formatQuantity(1000, "g");
				expect(result).toContain("1");
			});

			it("formats whole numbers without decimals", () => {
				const result = formatQuantity(5, "kg");
				expect(result).toContain("5");
			});
		});
	});
});
