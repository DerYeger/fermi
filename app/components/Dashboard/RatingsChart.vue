<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Ratings" icon="lucide:radar" />
		</template>
		<Loader v-if="isLoading" />
		<div v-if="!hasData" class="p-4 flex-center text-sm text-muted">
			No ratings.
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

	const { data, isLoading } = useCompletedFerments();

	const hasData = computed(() => !!data.value?.length);

	const ratings = ["overall", "flavor", "texture", "process"] as const;

	const chartData = computed(() => {
		return Stream.from(data.value).map((ferment) => {
			if (ferment.state !== "completed") return null;
			return ratings.map((rating) => ferment[rating].stars ?? 0);
		}).filterNonNull().toArray();
	});

	const colorMode = useColorMode();
	const textMuted = useCssVar("--ui-text-muted");
	const yellow = useCssVar("--color-warning");

	const SPLITS = 5;

	const chartOptions = computed<ECBasicOption>(() => ({
		color: yellow,
		darkMode: colorMode.value === "dark",
		tooltip: {
			show: false
		},
		radar: {
			indicator: ratings.map((name) => ({
				name: name.substring(0, 1).toUpperCase() + name.substring(1),
				min: 0,
				max: SPLITS
			})),
			radius: "75%",
			axisName: {
				color: yellow
			},
			axisLine: {
				lineStyle: {
					color: yellow
				}
			},
			shape: "circle",
			splitNumber: SPLITS,
			splitLine: {
				lineStyle: {
					color: Array.from({ length: SPLITS }, (_, i) => `rgba(from ${textMuted} r g b / ${0.15 * (i / 2 + 1)})`)
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
					opacity: 0.1
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
