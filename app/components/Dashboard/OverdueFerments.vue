<template>
	<UCard>
		<template #header>
			<CardHeader title="Overdue Ferments" icon="lucide:clock-alert" />
		</template>
		<Loader v-if="isLoading" class="p-4" />
		<div v-if="data.length === 0" class="p-4 flex-center text-sm text-muted">
			No overdue ferments.
		</div>
		<UScrollArea v-slot="{ item }" :items="data" orientation="vertical" :virtualize="{ gap: 16 }">
			<div class="flex justify-center gap-2 w-fit">
				<UButton variant="subtle" size="sm" icon="lucide:arrow-right" :to="{ name: 'ferment-id', params: { id: item.id } }">
					{{ item.name }}
				</UButton>
				<div>
					<UBadge size="sm" color="warning" variant="subtle">
						{{ formatTimeSince(item.endDate!, today) }}
					</UBadge>
				</div>
			</div>
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
