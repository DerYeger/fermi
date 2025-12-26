<template>
	<UFormField label="Name" name="name" required>
		<UInput v-model="model" placeholder="e.g., Garlic Honey, Kimchi, Sauerkraut..." />
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<string>({
		required: true
	});
</script>
