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
				// Fill till own endDate or lastEndDate
				const date = new Date(ferment.startDate);
				date.setDate(date.getDate() + 1);
				const endDate = ferment.state === "completed" ? new Date(ferment.endDate) : new Date(lastEndDate);
				fillUntil(date, endDate, "active");
			}
			if (ferment.state === "completed") {
				const endDateCount = getCount(ferment.endDate);
				endDateCount.active -= 1;
				endDateCount.completed += 1;
				if (ferment.endDate < lastEndDate) {
					const date = new Date(ferment.endDate);
					date.setDate(date.getDate() + 1);
					fillUntil(date, new Date(lastEndDate), "completed");
				}
			}
		});
		return Object.entries(counts)
			.map(([date, { active, completed }]) => ({ date, active, completed }))
			.sort((a, b) => a.date.localeCompare(b.date));
	});

	const hasData = computed(() => chartData.value.length > 1);

	const color = useChartPalette();

	const series = [
		{
			label: "Active",
			key: "active"
		},
		{
			label: "Completed",
			key: "completed"
		}
	] as const satisfies { label: string, key: Exclude<keyof typeof chartData["value"][number], "date"> }[];

	const colorMode = useColorMode();
	const chartOptions = computed<ECBasicOption>(() => ({
		color,
		darkMode: colorMode.value === "dark",
		tooltip: {
			trigger: "axis"
			// formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			type: "scroll",
			orient: "horizontal",
			left: 16,
			right: 16,
			top: 8,
			textStyle: {
				color: "var(--ui-text-muted)"
			}
		},
		xAxis: {
			type: "category",
			boundaryGap: false,
			data: chartData.value.map((item) => item.date)
		},
		yAxis: {
			type: "value"
		},
		dataZoom: [
			{
				type: "slider",
				start: 0,
				end: 100
			}
		],
		series: series.map(({ label, key }, index) => ({
			name: label,
			type: "line",
			symbol: "none",
			stack: "Total",
			sampling: "lltb",
			areaOptions: {},
			emphasis: {
				lineStyle: {
					color: color[index]
				}
			},
			data: chartData.value.map((item) => item[key])
		}))
	}));
</script>
