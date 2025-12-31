<template>
	<FermentList
		v-slot="{ ferment }"
		title="Today"
		icon="hugeicons:checkmark-square-01"
		:is-loading="isLoading"
		:items="data"
		no-items-text="No ferments are due today"
	>
		<UBadge color="neutral" variant="subtle">
			{{ formatTimeSince(today, ferment.startDate) }} old
		</UBadge>
	</FermentList>
</template>

<script setup lang="ts">
	import FermentList from "~/components/Dashboard/FermentList.vue";

	const { data, isLoading } = useDueFerments();
</script>
