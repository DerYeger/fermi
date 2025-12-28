<template>
	<UCard :ui="{ body: 'p-0!' }">
		<template #header>
			<CardHeader title="Average Ratings" icon="lucide:chart-column" />
		</template>
		<Loader v-if="isLoading" />
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

	type Count = [number, number, number, number, number];

	const chartData = computed(() => {
		const ratings = ["overall", "flavor", "texture", "process"] as const;
		const counts: Record<typeof ratings[number], Count> = {
			overall: [0, 0, 0, 0, 0],
			flavor: [0, 0, 0, 0, 0],
			texture: [0, 0, 0, 0, 0],
			process: [0, 0, 0, 0, 0]
		};

		data.value.forEach((ferment) => {
			if (ferment.state !== "completed") return;
			ratings.forEach((rating) => {
				const ratingValue = ferment[rating];
				if (typeof ratingValue.stars === "number") {
					counts[rating][ratingValue.stars - 1]! += 1;
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

	const yellow = useCssVar("--color-warning");
	const colorMode = useColorMode();

	const chartOptions = computed<ECBasicOption>(() => ({
		color: yellow,
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c}/5"
		},
		xAxis: { type: "category", data: chartData.value.map(({ name }) => name) },
		yAxis: {
			type: "value",
			min: 1,
			max: 5,
			step: 1,
			splitLine: {
				lineStyle: {
					width: 1,
					opacity: 0.75
				}
			}
		},
		emphasis: {
			disabled: true
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
