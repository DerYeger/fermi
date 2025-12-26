<template>
	<div>
		<UButton
			color="neutral"
			variant="ghost"
			:label="label"
			:icon="isSorted ? (isSorted === 'asc' ? 'i-lucide-arrow-up-narrow-wide' : 'i-lucide-arrow-down-wide-narrow') : 'i-lucide-arrow-up-down'"
			class="-mx-2.5"
			@click="toggleSorting"
		/>
	</div>
</template>

<script lang="ts" setup>
	import type { HeaderContext, SortDirection } from "@tanstack/vue-table";

	const { label, isSorted, context } = defineProps<{
		label: string
		isSorted: false | SortDirection
		context: HeaderContext<unknown, unknown>
	}>();

	function toggleSorting() {
		context.column.toggleSorting(isSorted === "asc");
	}
</script>
