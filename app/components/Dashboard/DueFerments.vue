<template>
	<UCard>
		<template #header>
			<CardHeader title="Today" icon="hugeicons:checkmark-square-01" />
		</template>
		<Loader v-if="isLoading" class="p-4" />
		<div v-if="data.length === 0" class="px-4 py-1.5 flex-center text-sm text-muted">
			No ferments are due today
		</div>
		<UScrollArea v-else v-slot="{ item, index }" :items="data" orientation="vertical" class="max-h-96" :ui="{ item: 'max-w-full' }">
			<div class="max-w-full flex gap-2 items-center">
				<UButton color="neutral" icon="hugeicons:view" variant="link" class="flex-1 truncate" :label="item.name" :to="`/ferments/${item.id}`" />
				<UBadge color="neutral" variant="subtle">
					{{ formatTimeSince(today, item.startDate) }} old
				</UBadge>
			</div>
			<USeparator v-if="index < data.length - 1" class="my-2" />
		</UScrollArea>
	</UCard>
</template>

<script setup lang="ts">
	import { and, eq, useLiveQuery } from "@tanstack/vue-db";

	const today = getISODate();

	const { data, isLoading } = useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => and(eq(ferment.state, "active"), eq(ferment.endDate, today)))
			.orderBy(({ ferment }) => ferment.endDate, "asc")
	);
</script>
