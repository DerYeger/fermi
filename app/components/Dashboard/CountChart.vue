<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="Counts" icon="hugeicons:pie-chart" />
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

	const { data, isLoading } = useFerments();

	const chartData = computed(() => {
		const lastEndDate = Stream
			.from(data.value)
			.map((ferment) => ferment.state === "completed" ? ferment.endDate : null)
			.filterNonNull()
			.reduce<string | null>((acc, date) => {
				if (!acc || date > acc) {
					return date;
				}
				return acc;
			}, null) ?? today.value;

		const counts: Record<string, { active: number, completed: number }> = {};

		function getCount(dateStr: string) {
			if (!counts[dateStr]) {
				counts[dateStr] = { active: 0, completed: 0 };
			}
			return counts[dateStr]!;
		}

		function fillUntil(from: Date, to: Date, type: keyof typeof counts[string]) {
			const date = new Date(from);
			// eslint-disable-next-line no-unmodified-loop-condition
			while (date <= to) {
				const betweenDateCount = getISODate(date);
				const counts = getCount(betweenDateCount);
				counts[type] += 1;
				date.setDate(date.getDate() + 1);
			}
		}

		data.value.forEach((ferment) => {
			{
				const startDateCount = getCount(ferment.startDate);
				startDateCount.active += 1;
			}
			{
				const date = new Date(ferment.startDate);
				date.setDate(date.getDate() + 1);
				const endDate = ferment.state === "completed" ? new Date(ferment.endDate) : new Date(lastEndDate);
				fillUntil(date, endDate, "active");
			}
			if (ferment.state !== "completed") {
				return;
			}
			const endDateCount = getCount(ferment.endDate);
			endDateCount.active -= 1;
			endDateCount.completed += 1;
			if (ferment.endDate < lastEndDate) {
				const date = new Date(ferment.endDate);
				date.setDate(date.getDate() + 1);
				fillUntil(date, new Date(lastEndDate), "completed");
			}
		});
		return Object.entries(counts)
			.map(([date, { active, completed }]) => ({ date, active, completed }))
			.sort((a, b) => a.date.localeCompare(b.date));
	});

	const hasData = computed(() => chartData.value.length > 1);

	const series = [
		{
			label: "Active",
			key: "active",
			color: ref("#04C950") // useCssVar("--color-success");
		},
		{
			label: "Completed",
			key: "completed",
			color: ref("#EFB200") // useCssVar("--color-warning");
		}
	] as const satisfies { color: Ref<string>, label: string, key: Exclude<keyof typeof chartData["value"][number], "date"> }[];

	const backgroundColor = useCssVar("--ui-bg");
	const borderColor = useCssVar("--ui-border");
	const textMutedColor = useCssVar("--ui-text-muted");
	const primaryColor = useCssVar("--color-primary");
	const warningColor = useCssVar("--color-warning");

	const colorMode = useColorMode();
	const chartOptions = computed<ECBasicOption>(() => ({
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "axis",
			borderColor: borderColor.value,
			backgroundColor: backgroundColor.value,
			textStyle: {
				color: textMutedColor.value
			}
		},
		legend: {
			type: "scroll",
			orient: "horizontal",
			left: 16,
			right: 16,
			top: 8,
			textStyle: {
				color: textMutedColor.value
			}
		},
		xAxis: {
			type: "category",
			boundaryGap: false,
			data: chartData.value.map((item) => item.date)
		},
		yAxis: {
			type: "value",
			min: 0,
			step: 1,
			position: "right",
			splitLine: {
				lineStyle: {
					width: 1,
					opacity: 0.75
				}
			}
		},
		visualMap: createVisualMap(chartData.value[0]?.completed ?? 0, (chartData.value?.at(-1)?.active ?? 0) + (chartData.value?.at(-1)?.completed ?? 0)),
		dataZoom: [
			{
				type: "slider",
				start: 90,
				end: 100,
				borderColor: borderColor.value,
				backgroundColor: backgroundColor.value,
				fillerColor: `rgba(from ${primaryColor.value} r g b / 0.05)`, // selected range
				dataBackground: {
					lineStyle: {
						color: warningColor.value
					},
					areaStyle: {
						color: warningColor.value
					}
				},
				moveHandleStyle: {
					color: backgroundColor.value,
					borderColor: textMutedColor.value
				},
				handleStyle: {
					color: backgroundColor.value,
					borderColor: textMutedColor.value
				},
				textStyle: {
					color: textMutedColor.value
				},
				emphasis: {
					handleStyle: {
						color: backgroundColor.value,
						borderColor: textMutedColor.value
					}
				}
			}
		],
		grid: {
			top: 64,
			bottom: 96,
			left: 48,
			right: 64
		},
		series: series.map(({ label, key, color }) => ({
			name: label,
			type: "line",
			color: color.value,
			symbol: "none",
			stack: "Total",
			sampling: "lltb",
			areaStyle: {},
			smooth: false,
			lineStyle: {
				width: 1
			},
			emphasis: {
				focus: "series",
				areaStyle: {
					color: color.value
				},
				lineStyle: {
					color: color.value
				}
			},
			data: chartData.value.map((item) => item[key])
		}))
	}));
</script>
