<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Ingredient Usage" icon="hugeicons:pie-chart" />
		</template>
		<Loader v-if="isLoading" />
		<div v-if="!hasData" class="px-4 py-1.5 flex-center text-sm text-muted">
			No data
		</div>
		<div v-else class="h-80">
			<VChart :option="chartOptions" autoresize />
		</div>
	</UCard>
</template>

<script setup lang="ts">
	import type { ECBasicOption } from "echarts/types/dist/shared";
	import VChart from "vue-echarts";
	import { limitLength } from "~/types/utils";

	const { data, isLoading } = useIngredients();

	const chartData = computed(() => {
		const counts: Record<string, number> = {};

		data.value.forEach((ferment) => {
			ferment.ingredients.forEach((ingredient) => {
				counts[ingredient.name] = (counts[ingredient.name] ?? 0) + 1;
			});
		});

		return Object.entries(counts)
			.map(([name, value]) => ({ name: limitLength(name, 20), value }));
	});

	const hasData = computed(() => chartData.value.length > 0);

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
