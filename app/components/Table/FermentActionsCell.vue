<template>
	<div class="flex items-center h-full">
		<FavoriteFermentButton :ferment="ferment" />
		<UButton
			icon="hugeicons:view"
			variant="ghost"
			size="sm"
			@click="navigateTo(`/ferments/${ferment.id}`)"
		/>
		<EditFermentButton :ferment="ferment" hide-label />
		<DuplicateFermentButton :ferment="ferment" hide-label />
		<UnarchiveFermentButton v-if="ferment.state === 'completed'" :ferment="ferment" hide-label />
		<UnfailFermentButton v-else-if="ferment.state === 'failed'" :ferment="ferment" hide-label />
		<DeleteFermentButton :ferment="ferment" hide-label />
	</div>
</template>

<script lang="ts" setup>
	import type { ArchivedFerment } from "~/types/ferment";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";

	const { ferment } = defineProps<{
		ferment: ArchivedFerment
	}>();
</script>
