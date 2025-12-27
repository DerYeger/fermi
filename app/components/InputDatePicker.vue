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
					<UCalendar v-model="internalModel" class="p-2" :is-date-disabled="isDateUnavailable" />
				</template>
			</UPopover>
		</template>
	</UInputDate>
</template>

<script setup lang="ts">
	import type { DateValue } from "@internationalized/date";
	import { CalendarDate } from "@internationalized/date";

	defineProps<{
		isDateUnavailable?: (date: DateValue) => boolean
	}>();

	const inputDate = useTemplateRef("inputDate");

	const model = defineModel<string | undefined>({
		required: true
	});

	const internalModel = computed({
		get() {
			const value = model.value;
			if (!value) return null;
			const date = new Date(model.value || "");
			return model.value ? new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate()) : null;
		},
		set(value: CalendarDate | null) {
			model.value = value ? value.toString() : undefined;
		}
	});
</script>
