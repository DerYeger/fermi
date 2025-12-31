<template>
	<FermentList
		v-slot="{ ferment }"
		title="Overdue"
		icon="hugeicons:alert-02"
		:is-loading="isLoading"
		:items="data"
		no-items-text="No overdue ferments"
	>
		<UBadge color="neutral" variant="subtle">
			{{ formatTimeSince(today, ferment.startDate) }} old
		</UBadge>
		<UBadge color="warning" variant="subtle">
			{{ formatTimeSince(ferment.endDate!, today) }} overdue
		</UBadge>
	</FermentList>
</template>

<script setup lang="ts">
	import FermentList from "~/components/Dashboard/FermentList.vue";

	const { data, isLoading } = useOverdueFerments();
</script>
