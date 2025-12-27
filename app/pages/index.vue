<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="ferments.length === 0" type="all" />

	<div v-else ref="scrollAreaWrapper">
		<UScrollArea
			v-slot="{ item }"
			:items="items"
			orientation="vertical"
			:virtualize="{ gap: 16, lanes, estimateSize: 280 }" :ui="{ root: 'p-1 -m-1' }"
		>
			<component :is="item" :key="item.name" />
		</UScrollArea>
	</div>
</template>

<script lang="ts" setup>
	import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";
	import IngredientsChart from "~/components/Dashboard/IngredientsChart.vue";
	import KPICard from "~/components/Dashboard/KPICard.vue";
	import OverdueFerments from "~/components/Dashboard/OverdueFerments.vue";

	const { data: ferments, isLoading } = useFerments();

	const items = [KPICard, IngredientsChart, FermentCalendar, OverdueFerments];

	const scrollAreaWrapper = useTemplateRef("scrollAreaWrapper");
	const { width } = useElementSize(scrollAreaWrapper);
	const lanes = computed(() => {
		return Math.max(1, Math.floor((width.value ?? 0) / 500));
	});
</script>
