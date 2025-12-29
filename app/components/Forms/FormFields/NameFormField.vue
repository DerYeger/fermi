<template>
	<UFormField label="Name" name="name" required>
		<UInputMenu
			v-model="model"
			v-model:open="open"
			v-model:search-term="searchTerm"
			create-item
			:items="names"
			placeholder="Garlic Honey, Kimchi, Sauerkraut..."
			@create="onCreate"
			@blur="onBlur"
		/>
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<string>({
		required: true
	});

	const names = useFermentNames(() => [model.value.trim()].filter(Boolean));

	const open = ref(false);
	const searchTerm = ref("");

	function onCreate(item: string) {
		model.value = item.trim();
	}

	function onBlur() {
		const trimmedSearchTerm = searchTerm.value.trim();
		if (!model.value && trimmedSearchTerm) {
			onCreate(trimmedSearchTerm);
		}
		open.value = false;
	}
</script>
