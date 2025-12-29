<template>
	<UFormField label="Name" name="name" required>
		<UInputMenu
			v-model="model"
			v-model:open="open"
			create-item
			:items="names"
			placeholder="Garlic Honey, Kimchi, Sauerkraut..."
			@create="onCreate"
			@blur="open = false"
		/>
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<string>({
		required: true
	});

	const names = useFermentNames(() => [model.value.trim()].filter(Boolean));

	const open = ref(false);

	function onCreate(item: string) {
		model.value = item.trim();
	}
</script>
