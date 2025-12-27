<template>
	<UInputDate ref="inputDate" v-model="internalModel" :is-date-unavailable="isDateUnavailable">
		<template #trailing>
			<UPopover :reference="inputDate?.inputsRef[3]?.$el">
				<UButton
					color="neutral"
					variant="link"
					size="sm"
					icon="i-lucide-calendar"
					aria-label="Select a date"
					class="px-0"
				/>
				<template #content>
					<UCalendar v-model="internalModel" :week-starts-on="FIRST_WEEK_DAY" class="p-2" :is-date-disabled="isDateUnavailable" />
				</template>
			</UPopover>
		</template>
	</UInputDate>
</template>

<script setup lang="ts">
	import type { CalendarDate, DateValue } from "@internationalized/date";
	import { FIRST_WEEK_DAY } from "#imports";

	defineProps<{
		isDateUnavailable?: (date: DateValue) => boolean
	}>();

	const inputDate = useTemplateRef("inputDate");

	const model = defineModel<string | null | undefined>({
		required: true
	});

	const internalModel = computed({
		get() {
			const value = model.value;
			if (!value) return null;
			const date = new Date(model.value || "");
			return model.value ? getCalendarDate(date) : null;
		},
		set(value: CalendarDate | null) {
			model.value = value?.toString().split("T")[0] ?? null;
		}
	});
</script>
