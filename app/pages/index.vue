<template>
	<div>
		<div v-if="isLoading" class="flex justify-center py-12">
			<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
		</div>

		<div v-else-if="ferments.length === 0" class="text-center py-12">
			<UIcon name="lucide:bar-chart-3" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
			<p class="text-(--ui-text-muted) mb-4">
				No data to visualize yet
			</p>
			<UButton to="/">
				Add Your First Ferment
			</UButton>
		</div>

		<div v-else class="grid gap-6 lg:grid-cols-2">
			<!-- Ingredient Pie Chart -->
			<UCard>
				<template #header>
					<div class="flex items-center gap-2">
						<UIcon name="lucide:pie-chart" class="size-5" />
						<h2 class="font-semibold">
							Ingredient Usage
						</h2>
					</div>
				</template>

				<div class="h-80">
					<VChart :option="ingredientChartOption" autoresize />
				</div>
			</UCard>

			<!-- Calendar View -->
			<UCard>
				<template #header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2">
							<UIcon name="lucide:calendar" class="size-5" />
							<h2 class="font-semibold">
								Fermentation Calendar
							</h2>
						</div>
						<div class="flex items-center gap-2">
							<UButton
								icon="lucide:chevron-left"
								variant="ghost"
								size="xs"
								@click="previousMonth"
							/>
							<span class="text-sm font-medium min-w-32 text-center">
								{{ currentMonthLabel }}
							</span>
							<UButton
								icon="lucide:chevron-right"
								variant="ghost"
								size="xs"
								@click="nextMonth"
							/>
						</div>
					</div>
				</template>

				<div class="space-y-4">
					<!-- Legend -->
					<div class="flex gap-4 text-xs">
						<div class="flex items-center gap-1.5">
							<span class="size-3 rounded bg-emerald-500" />
							<span>Start</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="size-3 rounded bg-amber-500" />
							<span>End</span>
						</div>
						<div class="flex items-center gap-1.5">
							<span class="size-3 rounded bg-violet-500" />
							<span>Both</span>
						</div>
					</div>

					<!-- Calendar Grid -->
					<div class="grid grid-cols-7 gap-1">
						<!-- Day headers -->
						<div
							v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']"
							:key="day"
							class="text-center text-xs font-medium text-(--ui-text-muted) py-2"
						>
							{{ day }}
						</div>

						<!-- Calendar days -->
						<div
							v-for="(day, index) in calendarDays"
							:key="index"
							class="relative aspect-square"
						>
							<UDropdownMenu
								v-if="day.date && day.ferments.length > 0"
								:items="getDayMenuItems(day)"
							>
								<div
									class="absolute inset-0 flex items-center justify-center rounded-lg text-sm transition-colors cursor-pointer"
									:class="getDayClasses(day)"
								>
									{{ day.date.getDate() }}
								</div>
							</UDropdownMenu>
							<div
								v-else-if="day.date"
								class="absolute inset-0 flex items-center justify-center rounded-lg text-sm transition-colors"
								:class="getDayClasses(day)"
							>
								{{ day.date.getDate() }}
							</div>
						</div>
					</div>
				</div>
			</UCard>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { DropdownMenuItem } from "@nuxt/ui";
	import type { Ferment } from "~/types/ferment";
	import { PieChart } from "echarts/charts";
	import { LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
	import { use } from "echarts/core";
	import { CanvasRenderer } from "echarts/renderers";
	import VChart from "vue-echarts";

	use([PieChart, TitleComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

	const { data: ferments, isLoading } = useFerments();

	// Ingredient Pie Chart
	const ingredientData = computed(() => {
		const counts: Record<string, number> = {};

		ferments.value.forEach((ferment) => {
			ferment.ingredients.forEach((ingredient) => {
				const name = ingredient.name.trim().toLowerCase();
				if (name) {
					const displayName = ingredient.name.trim();
					counts[displayName] = (counts[displayName] || 0) + 1;
				}
			});
		});

		return Object.entries(counts)
			.map(([name, value]) => ({ name, value }))
			.sort((a, b) => b.value - a.value);
	});

	const ingredientChartOption = computed(() => ({
		tooltip: {
			trigger: "item",
			formatter: "{b}: {c} ({d}%)"
		},
		legend: {
			type: "scroll",
			orient: "vertical",
			right: 10,
			top: 20,
			bottom: 20
		},
		series: [
			{
				type: "pie",
				radius: ["40%", "70%"],
				center: ["35%", "50%"],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 8,
					borderColor: "transparent",
					borderWidth: 2
				},
				label: {
					show: false
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 14,
						fontWeight: "bold"
					}
				},
				labelLine: {
					show: false
				},
				data: ingredientData.value
			}
		]
	}));

	// Calendar View
	const currentDate = ref(new Date());

	interface CalendarDay {
		date: Date | null
		ferments: { ferment: Ferment, type: "start" | "end" }[]
		hasStart: boolean
		hasEnd: boolean
	}

	const currentMonthLabel = computed(() => {
		return currentDate.value.toLocaleDateString("en-US", {
			month: "long",
			year: "numeric"
		});
	});

	function previousMonth() {
		const newDate = new Date(currentDate.value);
		newDate.setMonth(newDate.getMonth() - 1);
		currentDate.value = newDate;
	}

	function nextMonth() {
		const newDate = new Date(currentDate.value);
		newDate.setMonth(newDate.getMonth() + 1);
		currentDate.value = newDate;
	}

	const calendarDays = computed((): CalendarDay[] => {
		const year = currentDate.value.getFullYear();
		const month = currentDate.value.getMonth();

		// First day of the month
		const firstDay = new Date(year, month, 1);
		// Last day of the month
		const lastDay = new Date(year, month + 1, 0);

		// Get the day of week for the first day (0 = Sunday, adjust for Monday start)
		let startDayOfWeek = firstDay.getDay() - 1;
		if (startDayOfWeek < 0) startDayOfWeek = 6;

		const days: CalendarDay[] = [];

		// Add empty cells for days before the first of the month
		for (let i = 0; i < startDayOfWeek; i++) {
			days.push({ date: null, ferments: [], hasStart: false, hasEnd: false });
		}

		// Build a map of dates to ferments
		const dateMap = new Map<string, { ferment: Ferment, type: "start" | "end" }[]>();

		ferments.value.forEach((ferment) => {
			if (ferment.startDate) {
				const startKey = getDayString(ferment.startDate);
				if (!dateMap.has(startKey)) dateMap.set(startKey, []);
				dateMap.get(startKey)!.push({ ferment, type: "start" });
			}
			if (ferment.endDate) {
				const endKey = getDayString(ferment.endDate);
				if (!dateMap.has(endKey)) dateMap.set(endKey, []);
				dateMap.get(endKey)!.push({ ferment, type: "end" });
			}
		});

		// Add days of the month
		for (let day = 1; day <= lastDay.getDate(); day++) {
			const date = new Date(year, month, day);
			const dateKey = getDayString(date.toISOString());
			const dayFerments = (dateMap.get(dateKey) ?? []) as { ferment: Ferment, type: "start" | "end" }[];

			days.push({
				date,
				ferments: dayFerments,
				hasStart: dayFerments.some((f) => f.type === "start"),
				hasEnd: dayFerments.some((f) => f.type === "end")
			});
		}

		return days;
	});

	function getDayClasses(day: CalendarDay) {
		const classes: string[] = [];

		if (!day.date) return classes;

		const isCurrentMonth = day.date.getMonth() === currentDate.value.getMonth();

		if (!isCurrentMonth) {
			classes.push("text-(--ui-text-muted)");
		}

		if (day.hasStart && day.hasEnd) {
			classes.push("bg-violet-500 text-white font-medium");
		} else if (day.hasStart) {
			classes.push("bg-emerald-500 text-white font-medium");
		} else if (day.hasEnd) {
			classes.push("bg-amber-500 text-white font-medium");
		} else {
			classes.push("hover:bg-(--ui-bg-elevated)");
		}

		if (day.ferments.length > 0) {
			classes.push("cursor-pointer");
		}

		return classes;
	}

	function getDayMenuItems(day: CalendarDay) {
		const startedFermentItems: DropdownMenuItem[] = [
			{
				type: "label",
				label: "Started"
			}
		];
		const endedFermentItems: DropdownMenuItem[] = [{
			type: "label",
			label: "Ended"
		}];
		day.ferments.forEach((item) => {
			const menuItem: DropdownMenuItem = {
				type: "link",
				label: item.ferment.name,
				to: `/ferment/${item.ferment.id}`
			};
			if (item.type === "start") {
				startedFermentItems.push(menuItem);
			} else if (item.type === "end") {
				endedFermentItems.push(menuItem);
			}
		});
		const allItems: DropdownMenuItem[][] = [];
		if (startedFermentItems.length > 1) {
			allItems.push(startedFermentItems);
		}
		if (endedFermentItems.length > 1) {
			allItems.push(endedFermentItems);
		}
		return allItems;
	}

	function getDayString(date: string) {
		return date.split("T")[0]!;
	}
</script>
