<template>
	<UFormField label="Salt ratio (%)" name="saltRatio" required>
		<div class="flex gap-2 items-center">
			<UInputNumber v-model="model" :min="0" :max="1" :step="0.001" :format-options="{ style: 'percent', minimumFractionDigits: 0, maximumFractionDigits: 1 }" />
			<UButton v-for="preset in presets" :key="preset" :tabindex="-1" :label="formatPercentage(preset)" variant="subtle" class="basis-1/6 justify-center" @click="model = preset" />
		</div>
	</UFormField>
</template>

<script setup lang="ts">
	import { formatPercentage } from "~/types/utils";

	const model = defineModel<number>({
		required: true
	});

	const presets = [0, 0.02, 0.025, 0.03, 0.035] as const;
</script>
