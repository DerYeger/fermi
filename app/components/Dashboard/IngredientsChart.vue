<template>
	<UCard :ui="{ body: 'p-0!' }">
		<template #header>
			<CardHeader title="Ingredient Usage" icon="lucide:pie-chart" />
		</template>
		<Loader v-if="isLoading" />
		<div v-else class="h-80">
			<VChart :option="chartOptions" autoresize />
		</div>
	</UCard>
</template>

<script setup lang="ts">
	import type { ECBasicOption } from "echarts/types/dist/shared";
	import VChart from "vue-echarts";

	const { data, isLoading } = useFerments();

	const chartData = computed(() => {
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
	const chartOptions = computed<ECBasicOption>(() => ({
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
				emphasis: {
					itemStyle: {
						color: "inherit",
						shadowBlur: 10,
						shadowOffsetX: 0,
						shadowColor: "inherit"
					}
				},
				data: chartData.value
			}
		]
	}));
</script>
