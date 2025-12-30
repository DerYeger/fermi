<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="ferments.length === 0" type="all" />

	<div v-else ref="scrollAreaWrapper">
		<UScrollArea
			v-slot="{ item }"
			:items="items"
			orientation="vertical"
			:virtualize="{ gap: 16, lanes, estimateSize: 500 }" :ui="{ root: 'p-1 -m-1' }"
		>
			<component :is="item" :key="item.name" />
		</UScrollArea>
	</div>
</template>

<script lang="ts" setup>
	import AverageRatingsChart from "~/components/Dashboard/AverageRatingsChart.vue";
	import DueFerments from "~/components/Dashboard/DueFerments.vue";
	import FavoritesList from "~/components/Dashboard/FavoritesList.vue";
	import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";
	import IngredientsChart from "~/components/Dashboard/IngredientsChart.vue";
	import KPICard from "~/components/Dashboard/KPICard.vue";
	import OverdueFerments from "~/components/Dashboard/OverdueFerments.vue";
	import RatingsChart from "~/components/Dashboard/RatingsChart.vue";

	const { data: ferments, isLoading } = useFerments();

	const items = [KPICard, DueFerments, FavoritesList, IngredientsChart, FermentCalendar, RatingsChart, OverdueFerments, AverageRatingsChart];

	const scrollAreaWrapper = useTemplateRef("scrollAreaWrapper");
	const { width } = useElementSize(scrollAreaWrapper);
	const lanes = computed(() => {
		return Math.max(1, Math.floor((width.value ?? 0) / 500));
	});
</script>
