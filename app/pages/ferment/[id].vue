<template>
	<div>
		<div v-if="isLoading" class="flex justify-center py-12">
			<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
		</div>

		<div v-else-if="!ferment" class="text-center py-12">
			<UIcon name="lucide:alert-circle" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
			<p class="text-(--ui-text-muted) mb-4">
				Ferment not found
			</p>
			<UButton to="/">
				Back to Ferments
			</UButton>
		</div>

		<FermentDetails v-else :ferment="ferment" />
	</div>
</template>

<script lang="ts" setup>
	const route = useRoute();
	const { ferments, isLoading } = useFermentationStore();

	const ferment = computed(() => {
		const fermentId = (route.params as any).id as string;
		return ferments.value.find((f) => f.id === fermentId);
	});
</script>
