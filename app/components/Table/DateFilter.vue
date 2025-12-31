<template>
	<UPopover v-model:open="open" :ui="{ content: 'min-w-fit p-4 flex items-center gap-2' }">
		<UButton
			icon="hugeicons:filter"
			variant="link"
			:color="open || isFiltered ? 'primary' : 'neutral'"
		/>
		<template #content>
			<USelect
				v-model="typeInput"
				class="w-26"
				placeholder="Mode..."
				:items="typeItems"
			/>
			<InputDatePicker v-if="typeInput !== 'between'" v-model="firstDateInput" />
			<template v-else>
				<InputDatePicker v-model="firstDateInput" />
				and
				<InputDatePicker v-model="secondDateInput" />
			</template>
			<UButton
				v-if="model"
				icon="hugeicons:cancel-01"
				variant="subtle"
				color="error"
				@click="reset"
			/>
		</template>
	</UPopover>
</template>

<script lang="ts" setup>
	import type { SelectItem } from "@nuxt/ui";
	import type { DateFilter, DateFilterState, DateFilterStateOptions } from "~/types/filter";
	import { deepEquals } from "@tanstack/vue-db";
	import { FILTER_BUS_KEY } from "~/types/filter";

	const { id, isFiltered, onUpdate } = defineProps<DateFilter>();

	const open = ref(false);

	const model = useLocalStorage<DateFilterState>(() => `date-filter-${id}`, null);

	useEventBus(FILTER_BUS_KEY).on((type) => {
		if (type === "clear") {
			reset();
		}
	});

	const typeItems: SelectItem[] = [
		{
			value: "before",
			label: "Before"
		},
		{
			value: "on",
			label: "On"
		},
		{
			value: "after",
			label: "After"
		},
		{
			value: "between",
			label: "Between"
		}
	];
	const typeInput = ref<DateFilterStateOptions["type"] | undefined>(model.value?.type ?? undefined);

	function getInitialFirstDate() {
		if (!model.value) {
			return undefined;
		} else if (model.value.type === "between") {
			return model.value.from;
		}
		return model.value.date;
	}

	function getInitialSecondDate() {
		if (!model.value) {
			return undefined;
		} else if (model.value.type === "between") {
			return model.value.to;
		}
		return model.value.date;
	}

	const firstDateInput = ref(getInitialFirstDate());
	const secondDateInput = ref(getInitialSecondDate());

	watchEffect(() => {
		if (typeInput.value !== "between") {
			return;
		}
		if (firstDateInput.value === undefined || secondDateInput.value === undefined) {
			return;
		}
		if (firstDateInput.value <= secondDateInput.value) {
			return;
		}
		const tmp = firstDateInput.value;
		firstDateInput.value = secondDateInput.value;
		secondDateInput.value = tmp;
	});

	watchEffect(() => {
		if (typeInput.value === undefined) {
			model.value = null;
			return;
		}
		if (typeInput.value !== "between") {
			if (firstDateInput.value === undefined) {
				model.value = undefined;
			} else {
				model.value = { type: typeInput.value, date: firstDateInput.value };
			}
			return;
		}
		if (firstDateInput.value === undefined || secondDateInput.value === undefined) {
			model.value = undefined;
			return;
		}
		model.value = { type: typeInput.value, from: firstDateInput.value, to: secondDateInput.value };
	});

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
		onUpdate(newValue);
	}, { immediate: true });

	function reset() {
		typeInput.value = undefined;
		firstDateInput.value = undefined;
		secondDateInput.value = undefined;
	}

	onBeforeUnmount(() => {
		onUpdate(null);
	});
</script>
