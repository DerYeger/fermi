<template>
	<UPopover v-model:open="open">
		<UButton
			icon="hugeicons:filter"
			variant="link"
			:ui="{
				leadingIcon: open || isApplied ? 'text-primary' : 'text-muted'
			}"
		/>
		<template #content>
			<div v-if="min !== max" class="w-64 px-4 pt-4 pb-2 flex flex-col gap-4">
				<USlider v-model="model" :min="min" :max="max" multiple :step="step" />
				<div class="flex justify-between text-muted text-sm">
					<div>
						{{ formatValue(model[0]) }}
					</div>
					<div>
						{{ formatValue(model[1]) }}
					</div>
				</div>
			</div>
			<div v-else class="text-muted text-sm p-4">
				No range available
			</div>
		</template>
	</UPopover>
</template>

<script lang="ts" setup>
	import type { NumberRangeFilter } from "~/types/filter";

	const { id, min, max, step, onUpdate, formatValue = (value) => value } = defineProps<NumberRangeFilter>();

	const open = ref(false);

	const model = useLocalStorage<[number, number]>(() => `number-range-filter-${id}`, [min, max]);

	const isApplied = computed(() => {
		return model.value[0] !== min || model.value[1] !== max;
	});

	watch(model, (newValue) => {
		onUpdate(
			{
				min: newValue[0],
				max: newValue[1]
			}
		);
	}, { immediate: true });

	watch([() => min, () => max], () => {
		// Ensure model values stay within updated min/max props
		if (model.value[0] < min) {
			model.value[0] = min;
		}
		if (model.value[1] > max) {
			model.value[1] = max;
		}
	}, { immediate: true });
</script>
