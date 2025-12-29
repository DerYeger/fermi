import type { Row } from "@tanstack/table-core";

interface FilterBase {
	id: string
}

export type MultiSelectFilterState = string[];

export interface MultiSelectFilter extends FilterBase {
	type: "multi-select"
	id: string
	items: string[]
	onUpdate: (selection: MultiSelectFilterState) => void
}

export function isMultiSelectFilterApplicable<T>(row: Row<T>, columnId: string, filterValue: MultiSelectFilterState) {
	if (filterValue.length === 0) {
		return true;
	}
	const value = row.getValue<string | string[]>(columnId);
	if (Array.isArray(value)) {
		return value.some((v) => filterValue.includes(v));
	}
	return filterValue.includes(value);
}

export interface NumberRangeFilterState {
	min: number
	max: number
}

export interface NumberRangeFilter extends FilterBase {
	type: "number-range"
	min: number
	max: number
	step: number
	onUpdate: (range: NumberRangeFilterState) => void
	formatValue?: (value: number) => string | number
}

export function isNumberRangeFilterApplicable<T>(row: Row<T>, columnId: string, filterValue: NumberRangeFilterState) {
	const value = row.getValue<number>(columnId);
	if (filterValue.min !== undefined && value < filterValue.min) {
		return false;
	}
	if (filterValue.max !== undefined && value > filterValue.max) {
		return false;
	}
	return true;
}

export type Filter = MultiSelectFilter | NumberRangeFilter;
