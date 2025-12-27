<template>
	<Loader v-if="isLoading" />

	<UError
		v-else-if="!ferment"
		redirect="/ferments"
		:error="{ statusMessage: 'Ferment not found', message: 'The ferment you are looking for does not exist.' }"
	>
		<template #actions>
			<UButton variant="subtle" to="/ferments">
				Back to ferments
			</UButton>
		</template>
	</UError>

	<FermentDetails v-else :ferment="ferment" />
</template>

<script lang="ts" setup>
	const route = useRoute("ferment-id");
	const { data, isLoading } = useFermentById(() => route.params.id);

	const ferment = computed(() => {
		return data.value[0];
	});
</script>
