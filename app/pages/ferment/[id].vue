<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
	</div>

	<div v-else-if="!ferment" class="text-center py-12">
		<UIcon name="lucide:alert-circle" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
		<p class="text-(--ui-text-muted) mb-4">
			Ferment not found
		</p>
		<UButton to="/ferments">
			Back to Ferments
		</UButton>
	</div>

	<FermentDetails v-else :ferment="ferment" />
</template>

<script lang="ts" setup>
	const route = useRoute("ferment-id");
	const { data, isLoading } = useFermentById(route.params.id);

	const ferment = computed(() => {
		return data.value[0];
	});
</script>
