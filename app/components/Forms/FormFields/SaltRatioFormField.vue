<template>
	<UFormField label="Salt ratio (%)" name="saltRatio" required>
		<div class="flex gap-2 items-center">
			<UInputNumber v-model="model" :min="0" :max="100" :step="0.1" />
			<UButton v-for="preset in presets" :key="preset" :label="`${preset}%`" variant="subtle" class="basis-1/6 justify-center" @click="model = preset" />
		</div>
	</UFormField>
</template>

<script setup lang="ts">
	const model = defineModel<number>({
		required: true
	});

	const presets = [0, 2, 2.5, 3, 3.5] as const;
</script>
