<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="data.length === 0" type="completed" />

	<div v-else class="-m-4 h-[calc(100%+2rem)] flex flex-col overflow-hidden">
		<UTable
			class="h-full"
			sticky
			:data="data as CompletedFerment[]" :columns="columns" :initial-state="{
				sorting: [{
					id: 'endDate',
					desc: true
				}]
			}"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { CellContext, ColumnDef, HeaderContext } from "@tanstack/vue-table";
	import type { CompletedFerment } from "~/types/ferment";
	import { createColumnHelper } from "@tanstack/vue-table";
	import FermentActionsCell from "~/components/Table/FermentActionsCell.vue";
	import IngredientsCell from "~/components/Table/IngredientsCell.vue";
	import SortableTableHeader from "~/components/Table/SortableTableHeader.vue";
	import StarsCell from "~/components/Table/StarsCell.vue";
	import { RATING_CATEGORIES } from "~/types/ferment";

	const { data, isLoading } = useCompletedFerments();

	function createSortableHeader<T>(label: string) {
		return (context: HeaderContext<CompletedFerment, T>) => {
			const isSorted = context.column.getIsSorted();
			return h(SortableTableHeader, {
				label,
				isSorted,
				onToggleSorting:
					(desc: boolean) => {
						context.column.toggleSorting(desc);
					}
			});
		};
	}

	function createStarsCell() {
		return (context: CellContext<CompletedFerment, number | null>) => {
			const stars = context.getValue();
			return h(StarsCell, { stars });
		};
	}

	const columnHelper = createColumnHelper<CompletedFerment>();

	const columns = [
		columnHelper.display({
			id: "actions",
			header: "",
			cell: (ctx) =>
				h(
					FermentActionsCell,
					{
						ferment: ctx.row.original
					}
				)
		}),
		columnHelper.accessor("name", {
			id: "name",
			header: createSortableHeader("Name")
		}),
		columnHelper.display({
			id: "ingredients",
			header: "Ingredients",
			cell: (ctx) =>
				h(IngredientsCell, { ingredients: ctx.row.original.ingredients })
		}),
		columnHelper.accessor("saltRatio", {
			id: "saltRatio",
			header: createSortableHeader("Salt"),
			cell: (ctx) => `${ctx.getValue()}%`
		}),
		columnHelper.accessor((row) => getDaysBetween(row.startDate, row.endDate), {
			id: "duration",
			header: createSortableHeader("Duration"),
			cell: (ctx) => `${ctx.getValue()} days`
		}),
		columnHelper.accessor("startDate", {
			id: "startDate",
			header: createSortableHeader("Start Date"),
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		columnHelper.accessor("endDate", {
			id: "endDate",
			header: createSortableHeader("End Date"),
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		...RATING_CATEGORIES.map((rating) =>
			columnHelper.accessor((row) => row[rating.key].stars, {
				id: rating.key,
				header: createSortableHeader(rating.name),
				cell: createStarsCell()
			}))
		/*
		columnHelper.accessor("createdAt", {
			id: "createdAt",
			header: createSortableHeader("Created At"),
			cell: (ctx) => formatDateTime(ctx.getValue())
		}),
		columnHelper.accessor("updatedAt", {
			id: "updatedAt",
			header: createSortableHeader("Updated At"),
			cell: (ctx) => formatDateTime(ctx.getValue())
		})
    */
	] as ColumnDef<CompletedFerment>[];
</script>
