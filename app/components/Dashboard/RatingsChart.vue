<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Ratings" icon="hugeicons:chart-radar" />
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

	const chartData = computed(() => {
		return Stream.from(data.value).map((ferment) => {
			if (ferment.state !== "completed") return null;
			return RATING_CATEGORIES.map((rating) => ferment[rating.key].stars ?? 0);
		}).filterNonNull().toArray();
	});

	const hasData = computed(() => chartData.value.some((category) => category.some((star) => star > 0)));

	const colorMode = useColorMode();
	const textMuted = useCssVar("--ui-text-muted");
	const warningColor = useCssVar("--color-warning");

	const chartOptions = computed<ECBasicOption>(() => ({
		color: warningColor.value,
		darkMode: colorMode.value === "dark",
		tooltip: {
			show: false
		},
		radar: {
			indicator: RATING_CATEGORIES.map((rating) => ({
				name: rating.name,
				min: 0,
				max: MAX_STARS
			})),
			radius: "75%",
			axisName: {
				color: warningColor.value
			},
			axisLine: {
				lineStyle: {
					color: warningColor.value
				}
			},
			shape: "circle",
			splitNumber: MAX_STARS,
			splitLine: {
				lineStyle: {
					color: Array.from({ length: MAX_STARS }, (_, i) => `rgba(from ${textMuted.value} r g b / ${0.15 * (i / 2 + 1)})`)
				}
			},
			splitArea: {
				show: false
			}
		},
		series: [
			{
				type: "radar",
				data: chartData.value,
				areaStyle: {
					opacity: 1 / chartData.value.length
				},
				emphasis: {
					disabled: true
				},
				lineStyle: {
					opacity: 0.5,
					width: 1
				},
				symbol: "none"
			}
		]
	}));
</script>
