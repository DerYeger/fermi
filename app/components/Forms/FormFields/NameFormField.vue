<template>
	<UFormField label="Name" name="name" required>
		<UInputMenu v-model="model" create-item :items="names" placeholder="e.g., Garlic Honey, Kimchi, Sauerkraut..." @create="model = $event" />
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<string>({
		required: true
	});

	const names = useFermentNames(() => [model.value.trim()].filter(Boolean));
</script>
