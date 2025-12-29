<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="data.length === 0" type="completed" />

	<div v-else class="-m-4 h-[calc(100%+2rem)]">
		<UContextMenu
			:items="contextMenuItems"
		>
			<UTable
				ref="table"
				v-model:column-visibility="columnVisibility"
				v-model:expanded="expanded"
				class="h-full overscroll-none overflow-auto"
				sticky
				:data="ferments"
				:columns="columns"
				:initial-state="{
					sorting: [{
						id: 'endDate',
						desc: true
					}]
				}"
			>
				<template #expanded="{ row }">
					<div class="sticky left-0 max-h-[50vh] w-dvw overflow-y-auto p-4 -m-4 mask-[linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-1rem),transparent)]">
						<FermentDetails :ferment="row.original" :with-header="false" />
					</div>
				</template>
			</UTable>
		</UContextMenu>
	</div>
</template>

<script setup lang="ts">
	import type { ContextMenuItem } from "@nuxt/ui";
	import type { CellContext, ColumnDef, HeaderContext } from "@tanstack/vue-table";
	import type { CompletedFerment } from "~/types/ferment";
	import { createColumnHelper } from "@tanstack/vue-table";
	import IngredientBadges from "~/components/IngredientBadges.vue";
	import FermentActionsCell from "~/components/Table/FermentActionsCell.vue";
	import SortableTableHeader from "~/components/Table/SortableTableHeader.vue";
	import StarsCell from "~/components/Table/StarsCell.vue";
	import { RATING_CATEGORIES } from "~/types/ferment";

	const { data, isLoading } = useCompletedFerments();
	const ferments = data as Ref<CompletedFerment[]>;

	const columnVisibility = useLocalStorage<Record<string, boolean>>("archive-column-visibility", {
		createdAt: false,
		updatedAt: false
	});
	const expanded = ref<Record<number, boolean>>({});

	const table = useTemplateRef("table");

	const columnLabels = {
		...RATING_CATEGORIES.reduce((acc, rating) => {
			acc[rating.key] = rating.name;
			return acc;
		}, {} as Record<typeof RATING_CATEGORIES[number]["key"], string>),
		name: "Name",
		container: "Container",
		ingredients: "Ingredients",
		saltRatio: "Salt",
		duration: "Duration",
		startDate: "Start date",
		endDate: "End date",
		createdAt: "Created at",
		updatedAt: "Updated at"
	} as const satisfies Partial<Record<keyof CompletedFerment | "duration", string>>;

	const contextMenuItems = computed(() => {
		const items: ContextMenuItem[] = [];
		const tableApi = table.value?.tableApi;

		const columnVisibilityItems: ContextMenuItem[] = tableApi?.getAllColumns()
			.filter((column) => column.getCanHide())
			.map((column) => ({
				label: columnLabels[column.id as keyof typeof columnLabels],
				type: "checkbox" as const,
				checked: column.getIsVisible(),
				onUpdateChecked(checked: boolean) {
					tableApi?.getColumn(column.id)?.toggleVisibility(!!checked);
				},
				onSelect(e: Event) {
					e.preventDefault();
				}
			})) ?? [];
		if (columnVisibilityItems.length > 0) {
			items.push({
				label: "Columns",
				type: "label",
				items: columnVisibilityItems
			});
			items.push(...columnVisibilityItems);
		}

		return items;
	});

	const UBadge = resolveComponent("UBadge");
	const UButton = resolveComponent("UButton");

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
			id: "expand",
			enableHiding: false,
			cell: ({ row }) =>
				h(UButton, {
					color: "neutral",
					variant: "ghost",
					icon: "i-lucide-chevron-down",
					square: true,
					"aria-label": "Expand",
					ui: {
						leadingIcon: [
							"transition-transform",
							row.getIsExpanded() ? "duration-200 rotate-180" : ""
						]
					},
					onClick: () => row.toggleExpanded()
				})
		}),
		columnHelper.accessor("name", {
			id: "name",
			header: createSortableHeader(columnLabels.name)
		}),
		columnHelper.accessor("container", {
			id: "container",
			header: createSortableHeader(columnLabels.container),
			cell: (ctx) => {
				const container = ctx.getValue();
				if (!container) {
					return null;
				}
				return h(UBadge, { color: "secondary", variant: "subtle", label: ctx.getValue() });
			}
		}),
		columnHelper.display({
			id: "ingredients",
			header: columnLabels.ingredients,
			cell: (ctx) =>
				h(IngredientBadges, { ingredients: ctx.row.original.ingredients })
		}),
		columnHelper.accessor("saltRatio", {
			id: "saltRatio",
			header: createSortableHeader(columnLabels.saltRatio),
			cell: (ctx) => `${ctx.getValue()}%`
		}),
		columnHelper.accessor((row) => getDaysBetween(row.startDate, row.endDate), {
			id: "duration",
			header: createSortableHeader(columnLabels.duration),
			cell: (ctx) => `${ctx.getValue()} days`
		}),
		columnHelper.accessor("startDate", {
			id: "startDate",
			header: createSortableHeader(columnLabels.startDate),
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		columnHelper.accessor("endDate", {
			id: "endDate",
			header: createSortableHeader(columnLabels.endDate),
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		...RATING_CATEGORIES.map((rating) =>
			columnHelper.accessor((row) => row[rating.key].stars, {
				id: rating.key,
				header: createSortableHeader(columnLabels[rating.key]),
				cell: createStarsCell()
			})),
		columnHelper.display({
			id: "actions",
			enableHiding: false,
			header: "",
			cell: (ctx) =>
				h(
					FermentActionsCell,
					{
						ferment: ctx.row.original
					}
				)
		}),
		columnHelper.accessor("createdAt", {
			id: "createdAt",
			header: createSortableHeader(columnLabels.createdAt),
			cell: (ctx) => formatDateTime(ctx.getValue())
		}),
		columnHelper.accessor("updatedAt", {
			id: "updatedAt",
			header: createSortableHeader(columnLabels.updatedAt),
			cell: (ctx) => formatDateTime(ctx.getValue())
		})

	] as ColumnDef<CompletedFerment>[];
</script>
