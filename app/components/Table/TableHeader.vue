<template>
	<div class="flex items-center">
		<SortButton
			v-if="isSorted !== null"
			:is-sorted="isSorted"
			@toggle-sorting="emit('toggleSorting', $event)"
		/>
		{{ label }}
		<MultiSelectFilter
			v-if="filter?.type === 'multi-select'" v-bind="filter"
		/>
		<NumberRangeFilter v-else-if="filter?.type === 'number-range'" v-bind="filter" />
		<DateFilter v-else-if="filter?.type === 'date'" v-bind="filter" />
	</div>
</template>

<script lang="ts" setup>
	import type { SortDirection } from "@tanstack/vue-table";
	import type { Filter } from "~/types/filter";
	import DateFilter from "~/components/Table/DateFilter.vue";
	import MultiSelectFilter from "~/components/Table/MultiSelectFilter.vue";
	import NumberRangeFilter from "~/components/Table/NumberRangeFilter.vue";
	import SortButton from "~/components/Table/SortButton.vue";

	const { label, isSorted, filter } = defineProps<{
		label: string
		isSorted: false | SortDirection | null
		filter?: Filter
	}>();

	const emit = defineEmits<{
		toggleSorting: [desc: boolean]
	}>();
</script>
