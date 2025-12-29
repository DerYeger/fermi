<template>
	<div class="flex items-center">
		<UButton
			color="neutral"
			variant="ghost"
			:label="label"
			:icon="isSorted ? (isSorted === 'asc' ? 'hugeicons:sort-by-up-02' : 'hugeicons:sort-by-down-02') : 'hugeicons:arrow-up-down'"
			class="-mx-2.5"
			:ui="{ leadingIcon: isSorted ? 'text-primary' : 'text-muted' }"
			@click="toggleSorting"
		/>
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
