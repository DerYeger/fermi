<template>
	<UCard>
		<template #header>
			<CardHeader title="Favorites" icon="hugeicons:heart" />
		</template>
		<Loader v-if="isLoading" class="p-4" />
		<div v-if="data.length === 0" class="px-4 py-1.5 flex-center text-sm text-muted">
			No favorites
		</div>
		<UScrollArea v-else v-slot="{ item, index }" :items="data" orientation="vertical" class="max-h-96" :ui="{ item: 'max-w-full' }">
			<UButton variant="link" color="neutral" icon="hugeicons:view" class="max-w-full truncate" :label="item.name" :to="`/ferments/${item.id}`" />
			<USeparator v-if="index < data.length - 1" class="my-2" />
		</UScrollArea>
	</UCard>
</template>

<script setup lang="ts">
	import { eq, useLiveQuery } from "@tanstack/vue-db";

	const { data, isLoading } = useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.isFavorite, true))
			.orderBy(({ ferment }) => ferment.name, "asc")
	);
</script>
