<template>
	<UPopover v-model:open="open">
		<UButton
			icon="hugeicons:filter"
			variant="link"
			:color="open || isFiltered ? 'primary' : 'neutral'"
		/>
		<template #content>
			<div v-if="min !== max" class="w-64 px-4 pt-4 pb-2 flex flex-col gap-4">
				<div v-if="true" class="flex justify-between gap-2">
					<UInputNumber v-model="model[0]" :min="min" :max="model[1]" :step="step" label="Min" :format-options="formatOptions" />
					<UInputNumber v-model="model[1]" :min="model[0]" :max="max" :step="step" label="Max" :format-options="formatOptions" />
				</div>
				<USlider v-model="model" :min="min" :max="max" multiple :step="step" tooltip />
				<div class="flex gap-1 items-center text-muted text-sm">
					<div>
						{{ formatValue(min) }}
					</div>
					<div class="flex-1 flex-center">
						<UButton variant="link" color="error" size="sm" @click="reset">
							Reset
						</UButton>
					</div>
					<div>
						{{ formatValue(max) }}
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
	import { deepEquals } from "@tanstack/vue-db";
	import { formatPercentage } from "~/types/utils";

	const { id, min, max, step, isFiltered, onUpdate, percentage } = defineProps<NumberRangeFilter>();

	const formatOptions = computed(() => {
		if (percentage) {
			return { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 } as const;
		}
		return undefined;
	});

	function formatValue(value: number) {
		if (percentage) {
			return formatPercentage(value);
		}
		return value.toString();
	}

	const open = ref(false);

	const model = useLocalStorage<[number, number]>(() => `number-range-filter-${id}`, [min, max]);

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
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
		if (model.value[0] > model.value[1]) {
			const tmp = model.value[0];
			model.value[0] = model.value[1];
			model.value[1] = tmp;
		}
	}, { immediate: true });

	function reset() {
		model.value = [min, max];
	}
</script>
