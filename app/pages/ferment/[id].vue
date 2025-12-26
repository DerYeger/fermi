<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-muted" />
	</div>

	<UError
		v-else-if="!ferment"
		redirect="/ferments"
		:error="{ statusMessage: 'Ferment not found', message: 'The ferment you are looking for does not exist.' }"
	>
		<template #actions>
			<UButton to="/ferments">
				Back to ferments
			</UButton>
		</template>
	</UError>

	<FermentDetails v-else :ferment="ferment" />
</template>

<script lang="ts" setup>
	const route = useRoute("ferment-id");
	const { data, isLoading } = useFermentById(route.params.id);

	const ferment = computed(() => {
		return data.value[0];
	});
</script>
