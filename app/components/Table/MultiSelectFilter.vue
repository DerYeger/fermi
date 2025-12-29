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
			item: 'max-w-50 truncate',
			empty: 'min-w-25',
			trailing: 'static p-1.5',
			trailingIcon: open || model.length > 0 ? 'text-primary' : 'text-muted hover:text-default'
		}"
	/>
</template>

<script lang="ts" setup>
	import type { MultiSelectFilter } from "~/types/filter";

	const { id, items, onUpdate } = defineProps<MultiSelectFilter>();

	const model = useLocalStorage(() => `multi-select-filter-${id}`, [] as string[]);

	const open = ref(false);

	watch(model, (newValue) => {
		onUpdate(newValue);
	}, { immediate: true });

	watch(() => items, (newItems) => {
		// Remove any selected values that are no longer in the items list
		const newItemSet = new Set(newItems);
		model.value = model.value.filter((value) => newItemSet.has(value));
	}, { immediate: true });
</script>
