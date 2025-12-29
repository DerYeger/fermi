<template>
	<UFormField label="Container" name="container">
		<div class="flex gap-2">
			<UInputMenu
				v-model="internalModel"
				v-model:open="open"
				v-model:search-term="searchTerm"
				create-item
				:items="containers"
				placeholder="Jar, Bottle, Crock..."
				@create="onCreate"
				@blur="onBlur"
			/>
			<UButton
				v-if="internalModel"
				icon="lucide:x"
				variant="ghost"
				color="error"
				@click="internalModel = undefined"
			/>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<string | null>({
		required: true
	});

	const internalModel = computed<string | undefined>({
		get: () => model.value ?? undefined,
		set: (value) => {
			model.value = value ?? null;
		}
	});

	const open = ref(false);
	const searchTerm = ref("");

	function onCreate(item: string) {
		internalModel.value = item.trim();
	}

	function onBlur() {
		const trimmedSearchTerm = searchTerm.value.trim();
		if (!internalModel.value && trimmedSearchTerm) {
			onCreate(trimmedSearchTerm);
		}
		open.value = false;
	}

	const containers = useFermentContainers(() => [model.value?.trim() ?? ""].filter(Boolean));
</script>
