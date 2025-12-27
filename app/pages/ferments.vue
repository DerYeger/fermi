<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-muted" />
	</div>

	<UEmpty v-else-if="data.length === 0" title="No active ferments" description="Active ferments will appear here." variant="naked">
		<template #actions>
			<NewFermentButton>
				Create new ferment
			</NewFermentButton>
		</template>
	</UEmpty>

	<div v-else>
		<UScrollArea ref="scrollArea" v-slot="{ item }" :items="data" orientation="vertical" :virtualize="{ gap: 24, lanes, estimateSize: 280 }" :ui="{ root: 'p-1 -mx-1' }">
			<FermentCard
				:ferment="item as ActiveFerment"
			/>
		</UScrollArea>
	</div>
</template>

<script lang="ts" setup>
	import type { ActiveFerment } from "~/types/ferment";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const scrollArea = useTemplateRef("scrollArea");
	const { width } = useElementSize(() => scrollArea.value?.$el);
	const lanes = computed(() => {
		return Math.max(1, Math.floor((width.value ?? 0) / 300));
	});

	const { data, isLoading } = useActiveFerments();
</script>
