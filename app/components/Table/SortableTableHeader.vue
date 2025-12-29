<template>
	<div>
		<UButton
			color="neutral"
			variant="ghost"
			:label="label"
			:icon="isSorted ? (isSorted === 'asc' ? 'hugeicons:sort-by-up-02' : 'hugeicons:sort-by-down-02') : 'hugeicons:arrow-up-down'"
			class="-mx-2.5"
			:ui="{ leadingIcon: isSorted ? 'text-primary' : 'text-muted' }"
			@click="toggleSorting"
		/>
	</div>
</template>

<script lang="ts" setup>
	import type { SortDirection } from "@tanstack/vue-table";

	const { label, isSorted } = defineProps<{
		label: string
		isSorted: false | SortDirection
	}>();

	const emit = defineEmits<{
		toggleSorting: [desc: boolean]
	}>();

	function toggleSorting() {
		emit("toggleSorting", isSorted === "asc");
	}
</script>
