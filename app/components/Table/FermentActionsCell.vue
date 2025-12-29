<template>
	<div class="flex items-center h-full">
		<UButton
			icon="lucide:eye"
			variant="ghost"
			size="sm"
			@click="navigateTo(`/ferments/${ferment.id}`)"
		/>
		<EditFermentButton :ferment="ferment" hide-label />
		<UnarchiveFermentButton :ferment="ferment" hide-label />
		<DeleteFermentButton :ferment="ferment" />
	</div>
</template>

<script lang="ts" setup>
	import type { CompletedFerment } from "~/types/ferment";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";

	const { ferment } = defineProps<{
		ferment: CompletedFerment
	}>();
</script>
