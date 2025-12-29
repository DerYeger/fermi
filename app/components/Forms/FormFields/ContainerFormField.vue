<template>
	<UFormField label="Container" name="container">
		<div class="flex gap-2">
			<UInputMenu
				v-model="internalModel"
				v-model:open="open"
				create-item
				:items="containers"
				placeholder="Jar, Bottle, Crock..."
				@create="onCreate"
				@blur="open = false"
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
			model.value = value?.trim() || null;
		}
	});

	const open = ref(false);

	function onCreate(item: string) {
		internalModel.value = item;
	}

	const containers = useFermentContainers(() => [model.value?.trim() ?? ""].filter(Boolean));
</script>
