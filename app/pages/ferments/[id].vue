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
	const route = useRoute("ferments-id");
	const { data, isLoading } = useFermentById(() => route.params.id);
	const { selectedFerment, selectFerment, clearSelection } = useChatFermentContext();

	const ferment = computed(() => {
		return data.value;
	});

	const wasAutoSelected = ref(false);

	watch(ferment, (newFerment) => {
		wasAutoSelected.value = false;
		if (newFerment && !selectedFerment.value) {
			selectFerment(newFerment);
			wasAutoSelected.value = true;
		}
	}, { immediate: true });

	onBeforeUnmount(() => {
		if (wasAutoSelected.value && selectedFerment.value?.id === ferment.value?.id) {
			clearSelection();
		}
	});
</script>
