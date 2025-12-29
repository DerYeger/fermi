<template>
	<div class="flex items-center">
		<UButton
			variant="link"
			:color="isSorted ? 'primary' : 'neutral'"
			:icon="isSorted ? (isSorted === 'asc' ? 'hugeicons:sort-by-up-02' : 'hugeicons:sort-by-down-02') : 'hugeicons:arrow-up-down'"
			@click="toggleSorting"
		/>
		{{ label }}
		<MultiSelectFilter v-if="filter?.type === 'multi-select'" v-bind="filter" />
		<NumberRangeFilter v-else-if="filter?.type === 'number-range'" v-bind="filter" />
	</div>
</template>

<script lang="ts" setup>
	import type { SortDirection } from "@tanstack/vue-table";
	import type { Filter } from "~/types/filter";
	import MultiSelectFilter from "~/components/Table/MultiSelectFilter.vue";
	import NumberRangeFilter from "~/components/Table/NumberRangeFilter.vue";

	const { label, isSorted, filter } = defineProps<{
		label: string
		isSorted: false | SortDirection
		filter?: Filter
	}>();

	const emit = defineEmits<{
		toggleSorting: [desc: boolean]
	}>();

	function toggleSorting() {
		emit("toggleSorting", isSorted === "asc");
	}
</script>
