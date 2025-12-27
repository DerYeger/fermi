<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="ferments.length === 0" type="all" />

	<div v-else class="grid gap-6 lg:grid-cols-2">
		<!-- Ingredient Pie Chart -->
		<UCard>
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="lucide:pie-chart" class="size-5" />
					<h2 class="font-semibold">
						Ingredient Usage
					</h2>
				</div>
			</template>

			<div class="h-80">
				<VChart :option="ingredientChartOption" autoresize />
			</div>
		</UCard>

		<!-- Calendar View -->
		<FermentCalendar />
	</div>
</template>

<script lang="ts" setup>
	import { PieChart } from "echarts/charts";
	import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import VChart from "vue-echarts";
	import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";

	use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

	const { data: ferments, isLoading } = useFerments();

	// Ingredient Pie Chart
	const ingredientData = computed(() => {
		const counts: Record<string, number> = {};

		ferments.value.forEach((ferment) => {
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
