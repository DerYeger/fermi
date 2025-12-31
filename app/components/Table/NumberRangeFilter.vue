<template>
	<UPopover v-model:open="open">
		<UButton
			icon="hugeicons:filter"
			variant="link"
			:color="open || isFiltered ? 'primary' : 'neutral'"
		/>
		<template #content>
			<div class="w-64 px-4 pt-4 pb-2 flex flex-col gap-4">
				<div class="flex justify-between gap-2">
					<UInputNumber v-model="model.min" :disabled="isDisabled" :min="min" :max="model.max" :step="step" label="Min" :format-options="formatOptions" />
					<UInputNumber v-model="model.max" :disabled="isDisabled" :min="model.min" :max="max" :step="step" label="Max" :format-options="formatOptions" />
				</div>
				<USlider v-model="sliderModel" :disabled="isDisabled" :min="min" :max="max" multiple :step="step" tooltip />
				<div class="flex gap-1 items-center text-muted text-sm">
					<div>
						{{ formatValue(min) }}
					</div>
					<div class="flex-1 flex justify-center">
						<UButton variant="link" color="error" @click="reset">
							Reset
						</UButton>
					</div>
					<div>
						{{ formatValue(max) }}
					</div>
				</div>
			</div>
		</template>
	</UPopover>
</template>

<script lang="ts" setup>
	import type { NumberRangeFilter, NumberRangeFilterState } from "~/types/filter";
	import { deepEquals } from "@tanstack/vue-db";
	import { FILTER_BUS_KEY } from "~/types/filter";
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

	const isDisabled = computed(() => min === max);

	const model = useLocalStorage<NumberRangeFilterState>(() => `number-range-filter-${id}`, { min, max });

	useEventBus(FILTER_BUS_KEY).on((type) => {
		if (type === "clear") {
			reset();
		}
	});

	const sliderModel = computed({
		get: (): [number, number] => [model.value.min, model.value.max],
		set: ([min, max]) => {
			model.value = { min, max };
		}
	});

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
		onUpdate(newValue);
	}, { immediate: true });

	watch([() => min, () => max], () => {
		// Ensure model values stay within updated min/max props
		if (model.value.min < min) {
			model.value.min = min;
		}
		if (model.value.max > max) {
			model.value.max = max;
		}
		if (model.value.min > model.value.max) {
			const tmp = model.value.min;
			model.value.min = model.value.max;
			model.value.max = tmp;
		}
	}, { immediate: true });

	function reset() {
		model.value = { min, max };
	}

	onBeforeUnmount(() => {
		onUpdate({ min, max });
	});
</script>
