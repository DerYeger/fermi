import type { FermentImage } from "~/types/ferment";
import { describe, expect, it } from "vitest";
import { deepClone, formatPercentage, limitLength, sortImages } from "~/types/utils";

describe("types/utils", () => {
	describe("deepClone", () => {
		it("should clone primitive values", () => {
			expect(deepClone(42)).toBe(42);
			expect(deepClone("hello")).toBe("hello");
			expect(deepClone(true)).toBe(true);
			expect(deepClone(null)).toBe(null);
		});

		it("should deep clone objects", () => {
			const original = { a: 1, b: { c: 2 } };
			const cloned = deepClone(original);
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned.b).not.toBe(original.b);
		});

		it("should deep clone arrays", () => {
			const original = [1, [2, 3], { a: 4 }];
			const cloned = deepClone(original);
			expect(cloned).toEqual(original);
			expect(cloned).not.toBe(original);
			expect(cloned[1]).not.toBe(original[1]);
		});
	});

	describe("limitLength", () => {
		it("should return original string or truncate with ellipsis based on max length", () => {
			expect(limitLength("hello", 10)).toBe("hello");
			expect(limitLength("hello", 5)).toBe("hello");
			expect(limitLength("hello world", 8)).toBe("hello...");
			expect(limitLength("", 5)).toBe("");
			expect(limitLength("ab", 3)).toBe("ab");
		});
	});

	describe("formatPercentage", () => {
		it("should format decimal to percentage", () => {
			expect(formatPercentage(0.5)).toMatch(/50[.,]0\s*%/);
			expect(formatPercentage(0)).toMatch(/0[.,]0\s*%/);
			expect(formatPercentage(1)).toMatch(/100[.,]0\s*%/);
		});
	});

	describe("sortImages", () => {
		const createImage = (id: string, date: string): FermentImage => ({
			id,
			base64: "data:image/png;base64,test",
			date
		});

		it("should sort images by date ascending and return empty array for empty input", () => {
			const images = [
				createImage("3", "2026-01-03"),
				createImage("1", "2026-01-01"),
				createImage("2", "2026-01-02")
			];
			const sorted = sortImages(images);
			expect(sorted.map((i) => i.id)).toEqual(["1", "2", "3"]);
			expect(sortImages([])).toEqual([]);
		});

		it("should not mutate original array", () => {
			const images = [
				createImage("2", "2026-01-02"),
				createImage("1", "2026-01-01")
			];
			const original = [...images];
			sortImages(images);
			expect(images).toEqual(original);
		});
	});
});
