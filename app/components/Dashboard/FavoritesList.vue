<template>
	<FermentList
		v-slot="{ ferment }"
		title="Favorites"
		icon="lucide:heart"
		:is-loading="isLoading"
		:items="data"
		no-items-text="No favorites"
	>
		<UBadge v-if="ferment.state === 'completed'" variant="subtle">
			Completed
		</UBadge>
	</FermentList>
</template>

<script setup lang="ts">
	import { eq, useLiveQuery } from "@tanstack/vue-db";
	import FermentList from "~/components/Dashboard/FermentList.vue";

	const { data, isLoading } = useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.isFavorite, true))
			.orderBy(({ ferment }) => ferment.name, "asc")
	);
</script>
