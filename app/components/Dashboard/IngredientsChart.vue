<template>
	<UCard>
		<template #header>
			<CardHeader title="Ingredient Usage" icon="lucide:pie-chart" />
		</template>

		<div class="h-80">
			<VChart :option="ingredientChartOption" autoresize />
		</div>
	</UCard>
</template>

<script setup lang="ts">
	import { PieChart } from "echarts/charts";
	import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import VChart from "vue-echarts";

	use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

	const { data } = useFerments();

	// Ingredient Pie Chart
	const ingredientData = computed(() => {
		const counts: Record<string, number> = {};

		data.value.forEach((ferment) => {
			ferment.ingredients.forEach((ingredient) => {
				const name = ingredient.name.trim().toLowerCase();
				if (name) {
					const displayName = ingredient.name.trim();
					counts[displayName] = (counts[displayName] || 0) + 1;
				}
			});
		});

		return Object.entries(counts)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);
	});

	const ingredientChartOption = computed(() => ({
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			type: "scroll",
			orient: "vertical",
			right: 10,
			top: 20,
			bottom: 20
		},
		series: [
			{
				type: "pie",
				radius: ["40%", "70%"],
				center: ["35%", "50%"],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 8,
					borderColor: "transparent",
					borderWidth: 2
				},
				label: {
					show: false
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 14,
						fontWeight: "bold"
					}
				},
				labelLine: {
					show: false
				},
				data: ingredientData.value
			}
		]
	}));
</script>
