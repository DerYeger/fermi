<template>
	<div>
		<UButton
			color="neutral"
			variant="ghost"
			:label="label"
			:icon="isSorted ? (isSorted === 'asc' ? 'lucide:arrow-up-narrow-wide' : 'lucide:arrow-down-wide-narrow') : 'lucide:arrow-up-down'"
			class="-mx-2.5"
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

	const emit = defineEmits <{
		toggleSorting: [desc: boolean]
	}>();

	function toggleSorting() {
		emit("toggleSorting", isSorted === "asc");
	}
</script>
