<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="data.length === 0" type="active" />

	<div v-else ref="scrollAreaWrapper">
		<UScrollArea v-slot="{ item }" :items="data" orientation="vertical" :virtualize="{ gap: 24, lanes, estimateSize: 280 }" :ui="{ root: 'p-1 -mx-1' }">
			<FermentCard
				:ferment="item as ActiveFerment"
			/>
		</UScrollArea>
	</div>
</template>

<script lang="ts" setup>
	import type { ActiveFerment } from "~/types/ferment";

	const scrollAreaWrapper = useTemplateRef("scrollAreaWrapper");
	const { width } = useElementSize(scrollAreaWrapper);
	const lanes = computed(() => {
		return Math.max(1, Math.floor((width.value ?? 0) / 300));
	});

	const { data, isLoading } = useActiveFerments();
</script>
