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
	import type { ECBasicOption } from "echarts/types/dist/shared";
	import VChart from "vue-echarts";

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
			.map(([name, value]) => ({ name, value }));
	});

	const color = useChartPalette();

	const colorMode = useColorMode();

	const ingredientChartOption = computed<ECBasicOption>(() => ({
		color,
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			type: "scroll",
			orient: "vertical",
			right: 8,
			top: 16,
			bottom: 16,
			textStyle: {
				color: "var(--ui-text-muted)"
			}
		},
		series: [
			{
				type: "pie",
				radius: ["50%", "90%"],
				center: ["35%", "50%"],
				label: {
					show: false
				},
				labelLine: {
					show: false
				},
				emphasis: {
					itemStyle: {
						color: "inherit",
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: "inherit"
					}
				},
				animationType: "scale",
				animationEasing: "elasticOut",
				data: ingredientData.value
			}
		]
	}));
</script>
