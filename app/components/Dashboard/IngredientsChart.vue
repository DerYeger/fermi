<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Ingredients" icon="hugeicons:pie-chart" />
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

		return Object
			.entries(counts)
			.map(([name, value]) => ({ name: limitLength(name, 20), value }))
			.sort((a, b) => a.value - b.value);
	});

	const hasData = computed(() => chartData.value.length > 0);

	const color = "#04C950"; // useCssVar("--color-success");
	const backgroundColor = useCssVar("--ui-bg");
	const borderColor = useCssVar("--ui-border");
	const textMutedColor = useCssVar("--ui-text-muted");

	const shadows = useChartShadows();
	const colorMode = useColorMode();
	const chartOptions = computed<ECBasicOption>(() => ({
		color,
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c} ({d}%)",
			borderColor: borderColor.value,
			backgroundColor: backgroundColor.value,
			textStyle: {
				color: textMutedColor.value
			}
		},
		legend: {
			type: "scroll",
			orient: "vertical",
			right: 8,
			top: 16,
			bottom: 16,
			textStyle: {
				color: textMutedColor.value
			}
		},
		visualMap: createVisualMap(chartData.value[0]?.value, chartData.value[chartData.value.length - 1]?.value),
		series: [
			{
				type: "pie",
				radius: ["60%", "90%"],
				center: ["35%", "50%"],
				label: {
					show: false
				},
				padAngle: 2,
				itemStyle: {
					...shadows.value,
					borderRadius: 8
				},
				emphasis: {
					itemStyle: {
						color: "inherit"
					}
				},
				data: chartData.value
			}
		]
	}));
</script>
