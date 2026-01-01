<template>
	<UCard :ui="{ body: hasData ? 'p-0!' : undefined }">
		<template #header>
			<CardHeader title="History" icon="hugeicons:chart-line-data-01" />
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

	const { data, isLoading } = useFerments();

	const chartData = computed(() => {
		const lastDate = today.value;

		const counts: Record<string, { active: number, completed: number, failed: number }> = {};

		function getCount(dateStr: string) {
			if (!counts[dateStr]) {
				counts[dateStr] = { active: 0, completed: 0, failed: 0 };
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
				const endDate = ferment.state === "active" ? new Date(lastDate) : new Date(ferment.endDate);
				fillUntil(date, endDate, "active");
			}
			if (ferment.state === "active") {
				return;
			}
			const endDateCount = getCount(ferment.endDate);
			endDateCount.active -= 1;
			endDateCount[ferment.state] += 1;
			if (ferment.endDate < lastDate) {
				const date = new Date(ferment.endDate);
				date.setDate(date.getDate() + 1);
				fillUntil(date, new Date(lastDate), ferment.state);
			}
		});
		return Object.entries(counts)
			.map(([date, { active, completed, failed }]) => ({ date, active, completed, failed }))
			.sort((a, b) => a.date.localeCompare(b.date));
	});

	const hasData = computed(() => chartData.value.length > 1);

	const series = [
		{
			label: "Active",
			key: "active",
			color: "#04C950" // useCssVar("--color-success");
		},
		{
			label: "Completed",
			key: "completed",
			color: "#EFB200" // useCssVar("--color-warning");
		},
		{
			label: "Failed",
			key: "failed",
			color: "#FB2C35" // useCssVar("--color-error");
		}
	] as const satisfies { color: string, label: string, key: Exclude<keyof typeof chartData["value"][number], "date"> }[];

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
			axisLabel: {
				color: textMutedColor.value
			},
			axisLine: {
				lineStyle: {
					color: borderColor.value
				}
			},
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
					color: borderColor.value
				}
			},
			axisLabel: {
				color: textMutedColor.value
			}
		},
		visualMap: createVisualMap(chartData.value[0]?.completed ?? 0, (chartData.value?.at(-1)?.active ?? 0) + (chartData.value?.at(-1)?.completed ?? 0)),
		dataZoom: [
			{
				type: "slider",
				start: 0,
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
			color,
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
					color: "inherit"
				},
				lineStyle: {
					color
				}
			},
			data: chartData.value.map((item) => item[key])
		}))
	}));
</script>
