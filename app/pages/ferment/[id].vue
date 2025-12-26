<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-muted" />
	</div>

	<UEmpty v-else-if="!ferment" title="Ferment not found" description="The ferment you are looking for does not exist." variant="naked">
		<template #actions>
			<UButton to="/ferments">
				Back to ferments
			</UButton>
		</template>
	</UEmpty>

	<FermentDetails v-else :ferment="ferment" />
</template>

<script lang="ts" setup>
	const route = useRoute("ferment-id");
	const { data, isLoading } = useFermentById(route.params.id);

	const ferment = computed(() => {
		return data.value[0];
	});
</script>
