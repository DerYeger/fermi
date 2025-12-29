import type { HeaderContext, Row } from "@tanstack/table-core";

interface FilterBase {
	id: string
	isFiltered: boolean
}

export type MultiSelectFilterState = Set<string>;

export interface MultiSelectFilter extends FilterBase {
	type: "multi-select"
	id: string
	items: string[]
	onUpdate: (selection: MultiSelectFilterState) => void
}

export function isMultiSelectFilterApplicable<T>(row: Row<T>, columnId: string, filterValue: MultiSelectFilterState) {
	if (filterValue.size === 0) {
		return true;
	}
	return row.getUniqueValues<string>(columnId).some((value) => filterValue.has(value));
}

export function multiSelectFilter<TData, TValue>(ctx: HeaderContext<TData, TValue>): MultiSelectFilter {
	const id = ctx.column.id;
	const items: string[] = [...ctx.column.getFacetedUniqueValues().keys()].filter(Boolean);
	return {
		type: "multi-select",
		id,
		items,
		isFiltered: ctx.column.getIsFiltered(),
		onUpdate: (state) => {
			const column = ctx.table.getColumn(id);
			column?.setFilterValue(state.size ? state : undefined);
		}
	};
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
	percentage?: boolean
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

export function createNumberRangeFilter<TData, TValue>(data: MaybeRefOrGetter<Pick<NumberRangeFilter, "min" | "max" | "percentage" | "step">>) {
	return (ctx: HeaderContext<TData, TValue>): NumberRangeFilter => {
		const id = ctx.column.id;
		return {
			...data,
			...toValue(data),
			id,
			type: "number-range",
			isFiltered: ctx.column.getIsFiltered(),
			onUpdate: (state) => {
				const column = ctx.table.getColumn(id);
				const isApplied = (state.min !== toValue(data).min || state.max !== toValue(data).max);
				column?.setFilterValue(isApplied ? state : undefined);
			}
		};
	};
}

export type Filter = MultiSelectFilter | NumberRangeFilter;
