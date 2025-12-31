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
				:column-pinning="{
					left: ['expand'],
					right: ['actions']
				}"
				:columns="columns"
				:get-row-id="(row) => row.id"
				:initial-state="{
					sorting: [{
						id: 'endDate',
						desc: true
					}]
				}"
				:faceted-options="{
					getFacetedRowModel: getFacetedRowModel(),
					getFacetedUniqueValues: getFacetedUniqueValues()
				}"
				:ui="{
					th: thClass
				}"
			>
				<template #expanded="{ row }">
					<div
						class="sticky left-0 max-h-[60vh] flex flex-col -m-4"
						:style="{ width: `${tableSize.width.value}px` }"
					>
						<div class="flex-1 overflow-y-auto p-4 mask-[linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-1rem),transparent)]">
							<FermentDetails :ferment="row.original" :with-header="false" />
						</div>
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
	import type { Filter } from "~/types/filter";
	import { createColumnHelper, getFacetedRowModel, getFacetedUniqueValues } from "@tanstack/vue-table";
	import { Stream } from "@yeger/streams/sync";
	import IngredientBadges from "~/components/IngredientBadges.vue";
	import FermentActionsCell from "~/components/Table/FermentActionsCell.vue";
	import StarsCell from "~/components/Table/StarsCell.vue";
	import TableHeader from "~/components/Table/TableHeader.vue";
	import { MAX_STARS, RATING_CATEGORIES } from "~/types/ferment";
	import { booleanFilterFn, createBooleanFilter, createNumberRangeFilter, dateFilter, dateFilterFn, multiSelectFilter, multiSelectFilterFn, numberRangeFilterFn } from "~/types/filter";
	import { formatPercentage } from "~/types/utils";

	const { data, isLoading } = useCompletedFerments();
	const ferments = data as Ref<CompletedFerment[]>;

	const columnVisibility = useLocalStorage<Record<string, boolean>>("archive-column-visibility", {
		createdAt: false,
		updatedAt: false
	});
	const expanded = ref<Record<string, boolean>>({});

	const thClass = "[&[data-pinned='right']>div]:justify-end";

	const table = useTemplateRef("table");
	const tableSize = useElementSize(() => table.value?.$el);

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
		startDate: "Start",
		endDate: "End",
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
					const isVisible = !!checked;
					column.toggleVisibility(isVisible);
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

	function createHeader<T>(label: string, createFilter?: (ctx: HeaderContext<CompletedFerment, T>) => Filter) {
		return (ctx: HeaderContext<CompletedFerment, T>) => {
			const isSorted = ctx.column.getCanSort() ? ctx.column.getIsSorted() : null;
			return h(TableHeader, {
				label,
				isSorted,
				filter: createFilter?.(ctx),
				onToggleSorting:
					(desc) => {
						ctx.column.toggleSorting(desc);
					}
			});
		};
	}

	function createStarsCell() {
		return (context: CellContext<CompletedFerment, number | null>) => {
			const stars = context.getValue();
			if (stars === null) {
				return null;
			}
			return h(StarsCell, { stars });
		};
	}

	const saltRatioLimits = computed(() => {
		let min = Infinity;
		let max = 0;
		ferments.value.forEach((ferment) => {
			if (ferment.saltRatio < min) {
				min = ferment.saltRatio;
			}
			if (ferment.saltRatio > max) {
				max = ferment.saltRatio;
			}
		});
		if (min === Infinity) {
			min = 0;
		}
		return { min, max };
	});
	const durationLimits = computed(() => {
		let min = Infinity;
		let max = 0;
		ferments.value.forEach((ferment) => {
			const duration = getDaysBetween(ferment.startDate, ferment.endDate);
			if (duration < min) {
				min = duration;
			}
			if (duration > max) {
				max = duration;
			}
		});
		if (min === Infinity) {
			min = 0;
		}
		return { min, max };
	});

	const avgFormat = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 1
	});

	const columnHelper = createColumnHelper<CompletedFerment>();
	const columns = [
		columnHelper.display({
			id: "expand",
			enableHiding: false,
			header: (ctx) => {
				const filteredColumns = ctx.table.getAllColumns().filter((column) => column.getIsFiltered());
				if (filteredColumns.length === 0) {
					return null;
				}
				const label = filteredColumns.length === 1 ? "1 filter" : `${filteredColumns.length} filters`;
				return h(UBadge, {
					variant: "subtle",
					size: "sm",
					label
				});
			},
			cell: (ctx) =>
				h(UButton, {
					color: "neutral",
					variant: "ghost",
					icon: "hugeicons:arrow-down-01",
					square: true,
					"aria-label": "Expand",
					ui: {
						leadingIcon: [
							"transition-transform",
							ctx.row.getIsExpanded() ? "duration-200 rotate-180" : ""
						]
					},
					onClick: () => {
						expanded.value = { [ctx.row.id]: !ctx.row.getIsExpanded() };
					}
				}),
			footer: "Avg"
		}),
		columnHelper.accessor("name", {
			id: "name",
			header: createHeader(columnLabels.name, multiSelectFilter),
			filterFn: multiSelectFilterFn,
			meta: {
				class: {
					td: "max-w-[30ch] truncate"
				}
			}
		}),
		columnHelper.accessor("container", {
			id: "container",
			header: createHeader(columnLabels.container, multiSelectFilter),
			filterFn: multiSelectFilterFn,
			cell: (ctx) => {
				const container = ctx.getValue();
				if (!container) {
					return null;
				}
				return h(UBadge, { color: "secondary", variant: "subtle", label: ctx.getValue() });
			}
		}),
		columnHelper.accessor("ingredients", {
			id: "ingredients",
			getUniqueValues: (row) => row.ingredients.map((ing) => ing.name),
			header: createHeader(columnLabels.ingredients, multiSelectFilter),
			filterFn: multiSelectFilterFn,
			cell: (ctx) =>
				h(IngredientBadges, { ingredients: ctx.getValue() })
		}),
		columnHelper.accessor("saltRatio", {
			id: "saltRatio",
			header: createHeader(columnLabels.saltRatio, createNumberRangeFilter(() => ({
				...saltRatioLimits.value,
				step: 0.001,
				percentage: true
			}))),
			filterFn: numberRangeFilterFn,
			cell: (ctx) => formatPercentage(ctx.getValue()),
			footer: (ctx) => {
				const saltRatios = ctx.table.getGlobalFacetedRowModel().rows.map((row) => row.getValue<number>("saltRatio"));
				if (saltRatios.length === 0) {
					return null;
				}
				const avgSaltRatio = (Stream.from(saltRatios).sum() / saltRatios.length);
				return `${formatPercentage(avgSaltRatio)}`;
			}
		}),
		columnHelper.accessor((row) => getDaysBetween(row.startDate, row.endDate), {
			id: "duration",
			header: createHeader(columnLabels.duration, createNumberRangeFilter(() => ({
				...durationLimits.value,
				step: 1
			}))),
			filterFn: numberRangeFilterFn,
			cell: (ctx) => `${ctx.getValue()} days`,
			footer: (ctx) => {
				const durations = ctx.table.getGlobalFacetedRowModel().rows.map((row) => row.getValue<number>("duration"));
				if (durations.length === 0) {
					return null;
				}
				const avgDuration = (Stream.from(durations).sum() / durations.length);
				return `${avgFormat.format(avgDuration)} ${avgDuration === 1 ? "day" : "days"}`;
			}
		}),
		columnHelper.accessor("startDate", {
			id: "startDate",
			header: createHeader(columnLabels.startDate, dateFilter),
			filterFn: dateFilterFn,
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		columnHelper.accessor("endDate", {
			id: "endDate",
			header: createHeader(columnLabels.endDate, dateFilter),
			filterFn: dateFilterFn,
			cell: (ctx) => formatDate(ctx.getValue())
		}),
		...RATING_CATEGORIES.map((rating) =>
			columnHelper.accessor((row) => row[rating.key].stars, {
				id: rating.key,
				header: createHeader(columnLabels[rating.key], createNumberRangeFilter({
					min: 0,
					max: MAX_STARS,
					step: 1
				})),
				filterFn: numberRangeFilterFn,
				cell: createStarsCell(),
				footer: (ctx) => {
					const ratings = Stream.from(ctx.table.getGlobalFacetedRowModel().rows).map((row) => row.getValue<number | null>(rating.key)).filterNonNull().toArray();
					if (ratings.length === 0) {
						return null;
					}
					const avgRating = (Stream.from(ratings).sum() / ratings.length);
					return `${avgFormat.format(avgRating)} ${avgRating === 1 ? "star" : "stars"}`;
				}
			})),
		columnHelper.accessor("isFavorite", {
			id: "actions",
			enableSorting: false,
			enableHiding: false,
			header: createHeader("", createBooleanFilter("Only favorites")),
			cell: (ctx) =>
				h(
					FermentActionsCell,
					{
						ferment: ctx.row.original
					}
				),
			filterFn: booleanFilterFn
		}),
		columnHelper.accessor("createdAt", {
			id: "createdAt",
			header: createHeader(columnLabels.createdAt, dateFilter),
			filterFn: dateFilterFn,
			cell: (ctx) => formatDateTime(ctx.getValue())
		}),
		columnHelper.accessor("updatedAt", {
			id: "updatedAt",
			header: createHeader(columnLabels.updatedAt, dateFilter),
			filterFn: dateFilterFn,
			cell: (ctx) => formatDateTime(ctx.getValue())
		})
	] as ColumnDef<CompletedFerment>[];
</script>
