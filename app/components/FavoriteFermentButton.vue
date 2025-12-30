<template>
	<UButton
		variant="ghost"
		size="sm"
		icon="hugeicons:favourite"
		:color="isFavorite ? 'error' : 'neutral'"
		@click.stop="isFavorite = !isFavorite"
	/>
</template>

  <script setup lang="ts">
	import type { Ferment } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const isFavorite = computed({
		get: () => ferment.isFavorite,
		set: (value: boolean) => {
			FermentCollection.update(ferment.id, (draft) => {
				draft.isFavorite = value;
				draft.updatedAt = getISODatetime();
			});
		}
	});
</script>
