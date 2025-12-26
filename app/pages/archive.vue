<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-muted" />
	</div>

	<UEmpty v-else-if="data.length === 0" title="No completed ferments" description="Completed ferments will appear here." variant="naked">
		<template #actions>
			<NewFermentButton>
				Create new ferment
			</NewFermentButton>
			<UButton
				variant="ghost"
				label="See active ferments"
				@click="navigateTo('/ferments')"
			/>
		</template>
	</UEmpty>

	<div v-else>
		<UTable
			:data="data as CompletedFerment[]" class="flex-1" :columns="columns" :initial-state="{
				sorting: [{
					id: 'endDate',
					desc: false
				}]
			}"
		/>
	</div>
</template>

<script setup lang="ts">
	import type { CellContext, ColumnDef, HeaderContext } from "@tanstack/vue-table";
	import type { CompletedFerment } from "~/types/ferment";
	import { createColumnHelper } from "@tanstack/vue-table";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const { data, isLoading } = useCompletedFerments();

	const IngredientsCell = resolveComponent("IngredientsCell");
	const SortableTableHeader = resolveComponent("SortableTableHeader");
	const StarsCell = resolveComponent("StarsCell");
	const UButton = resolveComponent("UButton");

	function createSortableHeader<T>(label: string) {
		return (context: HeaderContext<CompletedFerment, T>) => {
			const isSorted = context.column.getIsSorted();
			return h(SortableTableHeader, { label, isSorted, context });
		};
	}

	function createStarsCell() {
		return (context: CellContext<CompletedFerment, number | undefined>) => {
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
					UButton,
					{
						icon: "lucide:eye",
						class: "p-2 -mx-2",
						variant: "ghost",
						onClick: () =>
							navigateTo(`/ferment/${ctx.row.original.id}`)
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
		columnHelper.accessor((row) => row.overall.stars, {
			id: "overall",
			header: createSortableHeader("Overall"),
			cell: createStarsCell()
		}),
		columnHelper.accessor((row) => row.flavor.stars, {
			id: "flavor",
			header: createSortableHeader("Flavor"),
			cell: createStarsCell()
		}),
		columnHelper.accessor((row) => row.texture.stars, {
			id: "texture",
			header: createSortableHeader("Texture"),
			cell: createStarsCell()
		}),
		columnHelper.accessor((row) => row.process.stars, {
			id: "process",
			header: createSortableHeader("Process"),
			cell: createStarsCell()
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
	] as ColumnDef<CompletedFerment>[];
</script>
