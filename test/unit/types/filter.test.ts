import type { Row } from "@tanstack/table-core";
import { describe, expect, it } from "vitest";
import {
	booleanFilterFn,
	dateFilterFn,
	multiSelectFilterFn,
	numberRangeFilterFn
} from "~/types/filter";

// Mock row factory
function createMockRow<T>(getValue: (columnId: string) => T, getUniqueValues?: (columnId: string) => T[]): Row<unknown> {
	return {
		getValue: getValue as Row<unknown>["getValue"],
		getUniqueValues: (getUniqueValues ?? ((columnId: string) => [getValue(columnId)])) as Row<unknown>["getUniqueValues"]
	} as Row<unknown>;
}

describe("types/filter", () => {
	describe("multiSelectFilterFn", () => {
		it("should return true when filter is empty or row value is in filter set", () => {
			const row = createMockRow(() => "value", () => ["value"]);
			expect(multiSelectFilterFn(row, "col", new Set())).toBe(true);

			const rowApple = createMockRow(() => "apple", () => ["apple"]);
			const filter = new Set(["apple", "banana"]);
			expect(multiSelectFilterFn(rowApple, "col", filter)).toBe(true);
		});

		it("should return false when row value is not in filter set", () => {
			const row = createMockRow(() => "cherry", () => ["cherry"]);
			const filter = new Set(["apple", "banana"]);
			expect(multiSelectFilterFn(row, "col", filter)).toBe(false);
		});
	});

	describe("numberRangeFilterFn", () => {
		it("should return true when value is within range (inclusive)", () => {
			const row = createMockRow(() => 50);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(true);

			const rowMin = createMockRow(() => 0);
			expect(numberRangeFilterFn(rowMin, "col", { min: 0, max: 100 })).toBe(true);

			const rowMax = createMockRow(() => 100);
			expect(numberRangeFilterFn(rowMax, "col", { min: 0, max: 100 })).toBe(true);
		});

		it("should return false when value is outside range", () => {
			const rowBelow = createMockRow(() => -5);
			expect(numberRangeFilterFn(rowBelow, "col", { min: 0, max: 100 })).toBe(false);

			const rowAbove = createMockRow(() => 150);
			expect(numberRangeFilterFn(rowAbove, "col", { min: 0, max: 100 })).toBe(false);
		});
	});

	describe("dateFilterFn", () => {
		it("should return true when filter is null", () => {
			const row = createMockRow(() => "2026-01-15");
			expect(dateFilterFn(row, "col", null)).toBe(true);
		});

		it("should filter dates before specified date", () => {
			const row = createMockRow(() => "2026-01-10");
			expect(dateFilterFn(row, "col", { type: "before", date: "2026-01-15" })).toBe(true);
			expect(dateFilterFn(row, "col", { type: "before", date: "2026-01-05" })).toBe(false);
		});

		it("should filter dates on specified date", () => {
			const row = createMockRow(() => "2026-01-15");
			expect(dateFilterFn(row, "col", { type: "on", date: "2026-01-15" })).toBe(true);
			expect(dateFilterFn(row, "col", { type: "on", date: "2026-01-10" })).toBe(false);
		});

		it("should filter dates after specified date", () => {
			const row = createMockRow(() => "2026-01-20");
			expect(dateFilterFn(row, "col", { type: "after", date: "2026-01-15" })).toBe(true);
			expect(dateFilterFn(row, "col", { type: "after", date: "2026-01-25" })).toBe(false);
		});

		it("should filter dates between specified range", () => {
			const row = createMockRow(() => "2026-01-15");
			expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(true);
			expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-01", to: "2026-01-10" })).toBe(false);
		});
	});

	describe("booleanFilterFn", () => {
		it("should return true when filter is null or row matches filter value", () => {
			const row = createMockRow(() => true);
			// @ts-expect-error - testing null case
			expect(booleanFilterFn(row, "col", null)).toBe(true);
			expect(booleanFilterFn(row, "col", true)).toBe(true);
		});

		it("should return false when row does not match filter value", () => {
			const row = createMockRow(() => false);
			expect(booleanFilterFn(row, "col", true)).toBe(false);
		});
	});
});
