import type { HeaderContext, Row } from "@tanstack/table-core";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { toValue } from "vue";

// We need to ensure toValue is available globally for auto-imports
beforeAll(() => {
	(globalThis as Record<string, unknown>).toValue = toValue;
});

// Dynamic import after setting up toValue
const {
	booleanFilterFn,
	createBooleanFilter,
	createNumberRangeFilter,
	dateFilter,
	dateFilterFn,
	multiSelectFilter,
	multiSelectFilterFn,
	numberRangeFilterFn
} = await import("~/types/filter");

// Mock row factory
function createMockRow<T>(getValue: (columnId: string) => T, getUniqueValues?: (columnId: string) => T[]): Row<unknown> {
	return {
		getValue: getValue as Row<unknown>["getValue"],
		getUniqueValues: (getUniqueValues ?? ((columnId: string) => [getValue(columnId)])) as Row<unknown>["getUniqueValues"]
	} as Row<unknown>;
}

describe("types/filter", () => {
	describe("multiSelectFilterFn", () => {
		it("returns true when filter set is empty (unset filter)", () => {
			const row = createMockRow(() => "value", () => ["value"]);
			expect(multiSelectFilterFn(row, "col", new Set())).toBe(true);
		});

		it("returns true when row value is in filter set", () => {
			const rowApple = createMockRow(() => "apple", () => ["apple"]);
			const filter = new Set(["apple", "banana"]);
			expect(multiSelectFilterFn(rowApple, "col", filter)).toBe(true);
		});

		it("returns false when row value is not in filter set", () => {
			const row = createMockRow(() => "cherry", () => ["cherry"]);
			const filter = new Set(["apple", "banana"]);
			expect(multiSelectFilterFn(row, "col", filter)).toBe(false);
		});

		it("returns true when any row unique value matches filter", () => {
			const row = createMockRow(() => "apple", () => ["apple", "cherry"]);
			const filter = new Set(["cherry"]);
			expect(multiSelectFilterFn(row, "col", filter)).toBe(true);
		});

		it("returns false when no unique values match filter", () => {
			const row = createMockRow(() => "grape", () => ["grape", "melon"]);
			const filter = new Set(["apple", "banana"]);
			expect(multiSelectFilterFn(row, "col", filter)).toBe(false);
		});

		it("handles single item filter set", () => {
			const matchingRow = createMockRow(() => "apple", () => ["apple"]);
			const nonMatchingRow = createMockRow(() => "banana", () => ["banana"]);
			const filter = new Set(["apple"]);
			expect(multiSelectFilterFn(matchingRow, "col", filter)).toBe(true);
			expect(multiSelectFilterFn(nonMatchingRow, "col", filter)).toBe(false);
		});
	});

	describe("numberRangeFilterFn", () => {
		it("returns true when value equals min boundary", () => {
			const row = createMockRow(() => 0);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(true);
		});

		it("returns true when value equals max boundary", () => {
			const row = createMockRow(() => 100);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(true);
		});

		it("returns true when value is within range", () => {
			const row = createMockRow(() => 50);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(true);
		});

		it("returns false when value is below min", () => {
			const row = createMockRow(() => -5);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(false);
		});

		it("returns false when value is above max", () => {
			const row = createMockRow(() => 150);
			expect(numberRangeFilterFn(row, "col", { min: 0, max: 100 })).toBe(false);
		});

		it("handles decimal values", () => {
			const row = createMockRow(() => 0.025);
			expect(numberRangeFilterFn(row, "col", { min: 0.01, max: 0.05 })).toBe(true);
			expect(numberRangeFilterFn(row, "col", { min: 0.03, max: 0.05 })).toBe(false);
		});

		it("handles negative ranges", () => {
			const row = createMockRow(() => -50);
			expect(numberRangeFilterFn(row, "col", { min: -100, max: -10 })).toBe(true);
			expect(numberRangeFilterFn(row, "col", { min: -40, max: 0 })).toBe(false);
		});

		it("handles single value range (min equals max)", () => {
			const matchingRow = createMockRow(() => 50);
			const nonMatchingRow = createMockRow(() => 51);
			expect(numberRangeFilterFn(matchingRow, "col", { min: 50, max: 50 })).toBe(true);
			expect(numberRangeFilterFn(nonMatchingRow, "col", { min: 50, max: 50 })).toBe(false);
		});
	});

	describe("dateFilterFn", () => {
		it("returns true when filter is null (unset filter)", () => {
			const row = createMockRow(() => "2026-01-15");
			expect(dateFilterFn(row, "col", null)).toBe(true);
		});

		describe("before mode", () => {
			it("returns true when date is before filter date", () => {
				const row = createMockRow(() => "2026-01-10");
				expect(dateFilterFn(row, "col", { type: "before", date: "2026-01-15" })).toBe(true);
			});

			it("returns true when date equals filter date (inclusive)", () => {
				const row = createMockRow(() => "2026-01-15");
				expect(dateFilterFn(row, "col", { type: "before", date: "2026-01-15" })).toBe(true);
			});

			it("returns false when date is after filter date", () => {
				const row = createMockRow(() => "2026-01-20");
				expect(dateFilterFn(row, "col", { type: "before", date: "2026-01-15" })).toBe(false);
			});
		});

		describe("on mode", () => {
			it("returns true when date matches exactly", () => {
				const row = createMockRow(() => "2026-01-15");
				expect(dateFilterFn(row, "col", { type: "on", date: "2026-01-15" })).toBe(true);
			});

			it("returns false when date does not match", () => {
				const row = createMockRow(() => "2026-01-10");
				expect(dateFilterFn(row, "col", { type: "on", date: "2026-01-15" })).toBe(false);
			});
		});

		describe("after mode", () => {
			it("returns true when date is after filter date", () => {
				const row = createMockRow(() => "2026-01-20");
				expect(dateFilterFn(row, "col", { type: "after", date: "2026-01-15" })).toBe(true);
			});

			it("returns true when date equals filter date (inclusive)", () => {
				const row = createMockRow(() => "2026-01-15");
				expect(dateFilterFn(row, "col", { type: "after", date: "2026-01-15" })).toBe(true);
			});

			it("returns false when date is before filter date", () => {
				const row = createMockRow(() => "2026-01-10");
				expect(dateFilterFn(row, "col", { type: "after", date: "2026-01-15" })).toBe(false);
			});
		});

		describe("between mode", () => {
			it("returns true when date is within range", () => {
				const row = createMockRow(() => "2026-01-15");
				expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(true);
			});

			it("returns true when date equals from boundary (inclusive)", () => {
				const row = createMockRow(() => "2026-01-10");
				expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(true);
			});

			it("returns true when date equals to boundary (inclusive)", () => {
				const row = createMockRow(() => "2026-01-20");
				expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(true);
			});

			it("returns false when date is before range", () => {
				const row = createMockRow(() => "2026-01-05");
				expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(false);
			});

			it("returns false when date is after range", () => {
				const row = createMockRow(() => "2026-01-25");
				expect(dateFilterFn(row, "col", { type: "between", from: "2026-01-10", to: "2026-01-20" })).toBe(false);
			});

			it("handles single day range (from equals to)", () => {
				const matchingRow = createMockRow(() => "2026-01-15");
				const nonMatchingRow = createMockRow(() => "2026-01-16");
				expect(dateFilterFn(matchingRow, "col", { type: "between", from: "2026-01-15", to: "2026-01-15" })).toBe(true);
				expect(dateFilterFn(nonMatchingRow, "col", { type: "between", from: "2026-01-15", to: "2026-01-15" })).toBe(false);
			});
		});
	});

	describe("booleanFilterFn", () => {
		it("returns true when filter is null (unset filter)", () => {
			const row = createMockRow(() => true);
			// @ts-expect-error - testing null case
			expect(booleanFilterFn(row, "col", null)).toBe(true);
		});

		it("returns true when row value matches true filter", () => {
			const row = createMockRow(() => true);
			expect(booleanFilterFn(row, "col", true)).toBe(true);
		});

		it("returns true when row value matches false filter", () => {
			const row = createMockRow(() => false);
			expect(booleanFilterFn(row, "col", false)).toBe(true);
		});

		it("returns false when row is false but filter is true", () => {
			const row = createMockRow(() => false);
			expect(booleanFilterFn(row, "col", true)).toBe(false);
		});

		it("returns false when row is true but filter is false", () => {
			const row = createMockRow(() => true);
			expect(booleanFilterFn(row, "col", false)).toBe(false);
		});
	});

	describe("multiSelectFilter", () => {
		function createMockHeaderContext(columnId: string, facetedValues: string[], isFiltered = false) {
			const setFilterValue = vi.fn();
			return {
				column: {
					id: columnId,
					getFacetedUniqueValues: () => new Map(facetedValues.map((v) => [v, 1])),
					getIsFiltered: () => isFiltered
				},
				table: {
					getColumn: () => ({ setFilterValue })
				},
				setFilterValue
			} as unknown as HeaderContext<unknown, unknown> & { setFilterValue: ReturnType<typeof vi.fn> };
		}

		it("creates filter with correct type", () => {
			const ctx = createMockHeaderContext("ingredients", ["Cabbage", "Salt"]);
			const filter = multiSelectFilter(ctx);
			expect(filter.type).toBe("multi-select");
		});

		it("creates filter with correct id", () => {
			const ctx = createMockHeaderContext("ingredients", []);
			const filter = multiSelectFilter(ctx);
			expect(filter.id).toBe("ingredients");
		});

		it("creates filter with faceted items excluding falsy values", () => {
			const ctx = createMockHeaderContext("col", ["Apple", "", "Banana", null as unknown as string]);
			const filter = multiSelectFilter(ctx);
			expect(filter.items).toEqual(["Apple", "Banana"]);
		});

		it("creates filter with isFiltered state", () => {
			const filteredCtx = createMockHeaderContext("col", [], true);
			const unfilteredCtx = createMockHeaderContext("col", [], false);
			expect(multiSelectFilter(filteredCtx).isFiltered).toBe(true);
			expect(multiSelectFilter(unfilteredCtx).isFiltered).toBe(false);
		});

		it("onUpdate sets filter value when state has items", () => {
			const ctx = createMockHeaderContext("col", []);
			const filter = multiSelectFilter(ctx);
			filter.onUpdate(new Set(["Apple"]));
			expect(ctx.setFilterValue).toHaveBeenCalledWith(new Set(["Apple"]));
		});

		it("onUpdate clears filter when state is empty", () => {
			const ctx = createMockHeaderContext("col", []);
			const filter = multiSelectFilter(ctx);
			filter.onUpdate(new Set());
			expect(ctx.setFilterValue).toHaveBeenCalledWith(undefined);
		});
	});

	describe("createNumberRangeFilter", () => {
		function createMockHeaderContext(columnId: string, isFiltered = false) {
			const setFilterValue = vi.fn();
			return {
				column: {
					id: columnId,
					getIsFiltered: () => isFiltered
				},
				table: {
					getColumn: () => ({ setFilterValue })
				},
				setFilterValue
			} as unknown as HeaderContext<unknown, unknown> & { setFilterValue: ReturnType<typeof vi.fn> };
		}

		it("creates filter with correct type", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("rating");
			const filter = factory(ctx);
			expect(filter.type).toBe("number-range");
		});

		it("creates filter with provided min, max, step values", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 5, step: 0.5, percentage: true });
			const ctx = createMockHeaderContext("rating");
			const filter = factory(ctx);
			expect(filter.min).toBe(0);
			expect(filter.max).toBe(5);
			expect(filter.step).toBe(0.5);
			expect(filter.percentage).toBe(true);
		});

		it("creates filter with correct id from column", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("saltRatio");
			const filter = factory(ctx);
			expect(filter.id).toBe("saltRatio");
		});

		it("onUpdate sets filter value when range differs from default", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate({ min: 10, max: 90 });
			expect(ctx.setFilterValue).toHaveBeenCalledWith({ min: 10, max: 90 });
		});

		it("onUpdate clears filter when range equals default", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate({ min: 0, max: 100 });
			expect(ctx.setFilterValue).toHaveBeenCalledWith(undefined);
		});

		it("onUpdate sets filter when only min differs", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate({ min: 5, max: 100 });
			expect(ctx.setFilterValue).toHaveBeenCalledWith({ min: 5, max: 100 });
		});

		it("onUpdate sets filter when only max differs", () => {
			const factory = createNumberRangeFilter({ min: 0, max: 100, step: 1 });
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate({ min: 0, max: 50 });
			expect(ctx.setFilterValue).toHaveBeenCalledWith({ min: 0, max: 50 });
		});
	});

	describe("dateFilter", () => {
		function createMockHeaderContext(columnId: string, isFiltered = false) {
			const setFilterValue = vi.fn();
			return {
				column: {
					id: columnId,
					getIsFiltered: () => isFiltered
				},
				table: {
					getColumn: () => ({ setFilterValue })
				},
				setFilterValue
			} as unknown as HeaderContext<unknown, string> & { setFilterValue: ReturnType<typeof vi.fn> };
		}

		it("creates filter with correct type", () => {
			const ctx = createMockHeaderContext("startDate");
			const filter = dateFilter(ctx);
			expect(filter.type).toBe("date");
		});

		it("creates filter with correct id", () => {
			const ctx = createMockHeaderContext("endDate");
			const filter = dateFilter(ctx);
			expect(filter.id).toBe("endDate");
		});

		it("creates filter with isFiltered state", () => {
			const filteredCtx = createMockHeaderContext("date", true);
			const unfilteredCtx = createMockHeaderContext("date", false);
			expect(dateFilter(filteredCtx).isFiltered).toBe(true);
			expect(dateFilter(unfilteredCtx).isFiltered).toBe(false);
		});

		it("onUpdate sets filter value with date state", () => {
			const ctx = createMockHeaderContext("date");
			const filter = dateFilter(ctx);
			filter.onUpdate({ type: "after", date: "2026-01-15" });
			expect(ctx.setFilterValue).toHaveBeenCalledWith({ type: "after", date: "2026-01-15" });
		});

		it("onUpdate clears filter when state is null", () => {
			const ctx = createMockHeaderContext("date");
			const filter = dateFilter(ctx);
			filter.onUpdate(null);
			expect(ctx.setFilterValue).toHaveBeenCalledWith(undefined);
		});
	});

	describe("createBooleanFilter", () => {
		function createMockHeaderContext(columnId: string, isFiltered = false) {
			const setFilterValue = vi.fn();
			return {
				column: {
					id: columnId,
					getIsFiltered: () => isFiltered
				},
				table: {
					getColumn: () => ({ setFilterValue })
				},
				setFilterValue
			} as unknown as HeaderContext<unknown, unknown> & { setFilterValue: ReturnType<typeof vi.fn> };
		}

		it("creates filter with correct type", () => {
			const factory = createBooleanFilter("Favorite");
			const ctx = createMockHeaderContext("favorite");
			const filter = factory(ctx);
			expect(filter.type).toBe("boolean");
		});

		it("creates filter with provided label", () => {
			const factory = createBooleanFilter("Is Active");
			const ctx = createMockHeaderContext("active");
			const filter = factory(ctx);
			expect(filter.label).toBe("Is Active");
		});

		it("creates filter with correct id", () => {
			const factory = createBooleanFilter("Label");
			const ctx = createMockHeaderContext("myColumn");
			const filter = factory(ctx);
			expect(filter.id).toBe("myColumn");
		});

		it("creates filter with isFiltered state", () => {
			const factory = createBooleanFilter("Label");
			const filteredCtx = createMockHeaderContext("col", true);
			const unfilteredCtx = createMockHeaderContext("col", false);
			expect(factory(filteredCtx).isFiltered).toBe(true);
			expect(factory(unfilteredCtx).isFiltered).toBe(false);
		});

		it("onUpdate sets filter value when true", () => {
			const factory = createBooleanFilter("Label");
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate(true);
			expect(ctx.setFilterValue).toHaveBeenCalledWith(true);
		});

		it("onUpdate clears filter when false", () => {
			const factory = createBooleanFilter("Label");
			const ctx = createMockHeaderContext("col");
			const filter = factory(ctx);
			filter.onUpdate(false);
			expect(ctx.setFilterValue).toHaveBeenCalledWith(undefined);
		});
	});
});
