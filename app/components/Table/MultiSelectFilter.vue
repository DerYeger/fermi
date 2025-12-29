<template>
	<USelectMenu
		v-model="model"
		v-model:open="open"
		trailing-icon="hugeicons:filter"
		variant="none"
		multiple
		:items="items"
		:ui="{
			base: 'p-0 cursor-pointer',
			value: 'hidden',
			placeholder: 'hidden',
			content: 'min-w-fit',
			item: 'min-w-25 max-w-50 truncate',
			empty: 'min-w-25',
			trailing: 'static p-1.5',
			trailingIcon: open || isFiltered ? 'text-primary' : 'text-muted hover:text-default'
		}"
	/>
</template>

<script lang="ts" setup>
	import type { MultiSelectFilter } from "~/types/filter";
	import { deepEquals } from "@tanstack/vue-db";

	const { id, items, isFiltered, onUpdate } = defineProps<MultiSelectFilter>();

	const model = useLocalStorage(() => `multi-select-filter-${id}`, [] as string[]);

	const open = ref(false);

	watch(model, (newValue, oldValue) => {
		if (deepEquals(newValue, oldValue)) return;
		onUpdate(new Set(newValue));
	}, { immediate: true });
</script>
