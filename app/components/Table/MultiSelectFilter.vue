<template>
	<USelectMenu
		v-model="model"
		v-model:open="open"
		trailing-icon="hugeicons:filter"
		variant="none"
		multiple
		:items="totalItems"
		:ui="{
			base: 'p-0 cursor-pointer',
			value: 'hidden',
			placeholder: 'hidden',
			content: 'min-w-fit max-w-50',
			item: 'min-w-25 truncate',
			empty: 'min-w-25',
			trailing: 'static p-1.5',
			trailingIcon: open || isFiltered ? 'text-primary' : 'text-muted hover:text-default'
		}"
	/>
</template>

<script lang="ts" setup>
	import type { MultiSelectFilter } from "~/types/filter";
	import { deepEquals } from "@tanstack/vue-db";
	import { Stream } from "@yeger/streams/sync";
	import { FILTER_BUS_KEY } from "~/types/filter";

	const { id, items, isFiltered, onUpdate } = defineProps<MultiSelectFilter>();

	const model = useLocalStorage<string[]>(() => `multi-select-filter-${id}`, []);

	const totalItems = computed(() => Stream.from(items).concat(model.value).distinct().toArray().sort((a, b) => a.localeCompare(b)));

	const open = ref(false);

	useEventBus(FILTER_BUS_KEY).on((type) => {
		if (type === "clear") {
			model.value = [];
		}
	});

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
		onUpdate(new Set(newValue));
	}, { immediate: true });

	onBeforeUnmount(() => {
		onUpdate(new Set());
	});
</script>
