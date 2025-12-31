<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Average Ratings" icon="hugeicons:chart-01" />
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
	import { Stream } from "@yeger/streams/sync";
	import VChart from "vue-echarts";
	import { MAX_STARS, RATING_CATEGORIES } from "~/types/ferment";

	const { data, isLoading } = useCompletedFerments();

	type StarCount = [number, number, number, number, number];

	const chartData = computed(() => {
		const counts: Record<typeof RATING_CATEGORIES[number]["key"], StarCount> = {
			overall: [0, 0, 0, 0, 0],
			flavor: [0, 0, 0, 0, 0],
			texture: [0, 0, 0, 0, 0],
			smell: [0, 0, 0, 0, 0],
			process: [0, 0, 0, 0, 0]
		};

		data.value.forEach((ferment) => {
			if (ferment.state !== "completed") return;
			RATING_CATEGORIES.forEach((rating) => {
				const ratingValue = ferment[rating.key];
				if (typeof ratingValue.stars === "number") {
					counts[rating.key][ratingValue.stars - 1]! += 1;
				}
			});
		});

		return Object.entries(counts).map(([category, count]) => {
			const ratingSum = Stream.from(count).map((value, index) => value * (index + 1)).sum();
			const numberOfRatings = Stream.from(count).sum();
			const average = ratingSum / numberOfRatings;
			return { name: category.substring(0, 1).toUpperCase() + category.substring(1), average };
		});
	});

	const hasData = computed(() => chartData.value.some((category) => category.average > 0));

	const borderColor = useCssVar("--ui-border");
	const backgroundColor = useCssVar("--ui-bg");
	const textMutedColor = useCssVar("--ui-text-muted");
	const warningColor = useCssVar("--color-warning");
	const colorMode = useColorMode();

	const chartOptions = computed<ECBasicOption>(() => ({
		color: warningColor.value,
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c}/5",
			borderColor: borderColor.value,
			backgroundColor: backgroundColor.value,
			textStyle: {
				color: textMutedColor.value
			}
		},
		xAxis: {
			type: "category",
			axisLabel: {
				color: textMutedColor.value
			},
			axisLine: {
				lineStyle: {
					color: borderColor.value
				}
			},
			data: chartData.value.map(({ name }) => name)
		},
		yAxis: {
			type: "value",
			min: 1,
			max: MAX_STARS,
			step: 1,
			splitLine: {
				lineStyle: {
					width: 1,
					color: borderColor.value
				}
			},
			axisLabel: {
				color: textMutedColor.value
			}
		},
		emphasis: {
			disabled: true
		},
		grid: {
			top: 48,
			bottom: 48,
			left: 48,
			right: 48
		},
		series: [{
			type: "bar",
			itemStyle: {
				opacity: 0.75
			},
			data: chartData.value.map(({ average }) => average)
		}]
	}));
</script>
