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
	onUpdate: (state: MultiSelectFilterState) => void
}

export function multiSelectFilterFn<T>(row: Row<T>, columnId: string, filterValue: MultiSelectFilterState) {
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
	onUpdate: (state: NumberRangeFilterState) => void
	percentage?: boolean
}

export function numberRangeFilterFn<T>(row: Row<T>, columnId: string, filterValue: NumberRangeFilterState) {
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

export type DateFilterStateOptions = {
	type: "before"
	date: string
} | {
	type: "after"
	date: string
} | {
	type: "on"
	date: string
} | {
	type: "between"
	from: string
	to: string
};
export type DateFilterState = DateFilterStateOptions | null;

export interface DateFilter extends FilterBase {
	type: "date"
	onUpdate: (state: DateFilterState) => void
}

export function dateFilterFn<T>(row: Row<T>, columnId: string, filterValue: DateFilterState) {
	if (!filterValue) {
		return true;
	}
	const rowValue = row.getValue<string>(columnId);
	if (filterValue.type === "before") {
		return rowValue <= filterValue.date;
	} else if (filterValue.type === "on") {
		return rowValue === filterValue.date;
	} else if (filterValue.type === "after") {
		return rowValue >= filterValue.date;
	}
	return rowValue >= filterValue.from && rowValue <= filterValue.to;
}

export function dateFilter<TData>(ctx: HeaderContext<TData, string>): DateFilter {
	const id = ctx.column.id;
	return {
		type: "date",
		id,
		isFiltered: ctx.column.getIsFiltered(),
		onUpdate: (state) => {
			const column = ctx.table.getColumn(id);
			column?.setFilterValue(state ?? undefined);
		}
	};
}

export type Filter = MultiSelectFilter | NumberRangeFilter | DateFilter;
