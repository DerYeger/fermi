<template>
	<UPopover v-model:open="open" :ui="{ content: 'min-w-fit p-4 flex items-center gap-2' }">
		<UButton
			icon="hugeicons:filter"
			variant="link"
			:color="open || isFiltered ? 'primary' : 'neutral'"
		/>
		<template #content>
			<USwitch v-model="model" :label="label" />
		</template>
	</UPopover>
</template>

<script lang="ts" setup>
	import type { BooleanFilter, BooleanFilterState } from "~/types/filter";
	import { deepEquals } from "@tanstack/vue-db";
	import { FILTER_BUS_KEY } from "~/types/filter";

	const { id, label, isFiltered, onUpdate } = defineProps<BooleanFilter>();

	const open = ref(false);

	const model = useLocalStorage<BooleanFilterState>(() => `boolean-filter-${id}`, false);

	useEventBus(FILTER_BUS_KEY).on((type) => {
		if (type === "clear") {
			model.value = false;
		}
	});

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
		onUpdate(newValue);
	}, { immediate: true });

	onBeforeUnmount(() => {
		onUpdate(false);
	});
</script>
