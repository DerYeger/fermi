<template>
	<UButton
		variant="link"
		:color="isSorted ? 'primary' : 'neutral'"
		:icon="isSorted ? (isSorted === 'asc' ? 'hugeicons:sort-by-up-02' : 'hugeicons:sort-by-down-02') : 'hugeicons:arrow-up-down'"
		@click="toggleSorting"
	/>
</template>

<script lang="ts" setup>
	import type { SortDirection } from "@tanstack/vue-table";

	const { isSorted } = defineProps<{
		isSorted: false | SortDirection
	}>();

	const emit = defineEmits<{
		toggleSorting: [desc: boolean]
	}>();

	function toggleSorting() {
		emit("toggleSorting", isSorted === "asc");
	}
</script>
