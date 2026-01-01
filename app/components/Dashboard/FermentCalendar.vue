<template>
	<UCard>
		<template #header>
			<CardHeader title="Calendar" icon="hugeicons:calendar-03" />
		</template>
		<UCalendar :week-starts-on="FIRST_WEEK_DAY" :model-value="todayCalendarDate" variant="subtle" color="neutral">
			<template #day="{ day }">
				<div v-if="getDayState(day).type" class="relative">
					<UDropdownMenu
						:items="getDayState(day).menuItems"
					>
						<UButton variant="link" :color="'illegal_hack' as any">
							<UChip size="sm" variant="solid" :color="getDayState(day).color">
								{{ day.day }}
							</UChip>
						</UButton>
					</UDropdownMenu>
				</div>
				<template v-else>
					{{ day.day }}
				</template>
			</template>
		</UCalendar>
		<template #footer>
			<div class="flex gap-2 justify-evenly text-sm text-muted">
				<div class="flex items-center gap-2">
					<UChip standalone inset color="success" />
					Started
				</div>
				<div class="flex items-center gap-2">
					<UChip standalone inset color="warning" />
					Ended
				</div>
				<div class="flex items-center gap-2">
					<UChip standalone inset color="error" />
					Both
				</div>
			</div>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
	import type { DateValue } from "@internationalized/date";
	import type { DropdownMenuItem } from "@nuxt/ui";
	import type { Ferment } from "~/types/ferment";
	import { FIRST_WEEK_DAY } from "#imports";

	const ferments = useFerments();

	const dateMaps = computed(() => {
		const startDateMap = new Map<string, Ferment[]>();
		const endDateMap = new Map<string, Ferment[]>();

		ferments.data.value?.forEach((ferment) => {
			const startDate = ferment.startDate;
			const endDate = ferment.endDate;

			if (startDate) {
				if (!startDateMap.has(startDate)) {
					startDateMap.set(startDate, []);
				}
				startDateMap.get(startDate)!.push(ferment);
			}

			if (endDate) {
				if (!endDateMap.has(endDate)) {
					endDateMap.set(endDate, []);
				}
				endDateMap.get(endDate)!.push(ferment);
			}
		});

		return { startDateMap, endDateMap };
	});

	interface DayState {
		menuItems: DropdownMenuItem[]
		type: "start" | "end" | "both" | false
		color: "success" | "warning" | "error" | undefined
	}

	const dayStates = reactive(new Map<string, DayState>());

	watch(dateMaps, () => {
		dayStates.clear();
	}, { deep: true });

	function getDayState(day: DateValue): DayState {
		const isoDate = getISODate(day);
		const cachedState = dayStates.get(isoDate) as DayState | undefined;
		if (cachedState) {
			return cachedState;
		}
		const type = getDayStateType(isoDate);
		const menuItems = getDayMenuItems(isoDate);
		const dayState: DayState = { type, menuItems, color: getDayColor(type) };
		dayStates.set(isoDate, dayState as any);
		return dayState;
	}

	function getDayStateType(isoDate: string): DayState["type"] {
		const hasStart = dateMaps.value.startDateMap.has(isoDate);
		const hasEnd = dateMaps.value.endDateMap.has(isoDate);
		if (hasStart && hasEnd) {
			return "both";
		} else if (hasStart) {
			return "start";
		} else if (hasEnd) {
			return "end";
		}
		return false;
	}

	function getDayMenuItems(isoDate: string): DropdownMenuItem[] {
		const items: DropdownMenuItem[] = [];
		const started = dateMaps.value.startDateMap.get(isoDate) ?? [];
		if (started.length > 0) {
			items.push({
				type: "label",
				label: "Started"
			});
			started.forEach((ferment) => {
				items.push({
					type: "link",
					label: ferment.name,
					to: `/ferments/${ferment.id}`
				});
			}
			);
		}
		const ended = dateMaps.value.endDateMap.get(isoDate) ?? [];
		if (ended.length > 0) {
			if (started.length > 0) {
				items.push({ type: "separator" });
			}
			items.push({
				type: "label",
				label: "Ended"
			});
			ended.forEach((ferment) => {
				items.push({
					type: "link",
					label: ferment.name,
					to: `/ferments/${ferment.id}`
				});
			});
		}
		return items;
	}

	function getDayColor(type: DayState["type"]): DayState["color"] {
		if (type === "both") {
			return "error";
		} else if (type === "start") {
			return "success";
		} else if (type === "end") {
			return "warning";
		}
		return undefined;
	}
</script>
