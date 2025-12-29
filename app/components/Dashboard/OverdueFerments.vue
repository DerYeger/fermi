<template>
	<UCard>
		<template #header>
			<CardHeader title="Overdue" icon="hugeicons:alert-02" />
		</template>
		<Loader v-if="isLoading" class="p-4" />
		<div v-if="data.length === 0" class="p-4 flex-center text-sm text-muted">
			No overdue ferments.
		</div>
		<UScrollArea v-else v-slot="{ item, index }" :items="data" orientation="vertical" class="max-h-96">
			<UButton variant="link" :to="`/ferments/${item.id}`">
				{{ item.name }}
				<UBadge class="ml-2" color="neutral" variant="subtle">
					{{ formatTimeSince(today, item.startDate) }} old
				</UBadge>
				<UBadge class="ml-2" color="warning" variant="subtle">
					{{ formatTimeSince(item.endDate!, today) }} overdue
				</UBadge>
			</UButton>
			<USeparator v-if="index < data.length - 1" class="my-2" />
		</UScrollArea>
	</UCard>
</template>

<script setup lang="ts">
	import { and, eq, lt, useLiveQuery } from "@tanstack/vue-db";

	const today = getISODate();

	const { data, isLoading } = useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => and(eq(ferment.state, "active"), lt(ferment.endDate, today)))
			.orderBy(({ ferment }) => ferment.endDate, "asc")
	);
</script>
