<template>
	<div class="grid grid-cols-2 gap-4">
		<UFormField label="Start date" name="startDate" required>
			<InputDatePicker v-model="startDate" :is-date-unavailable="(startDate) => isStartDateUnavailable(endDate, startDate)" />
		</UFormField>
		<UFormField label="End date" name="endDate" :required="isEndDateRequired">
			<div class="flex gap-2">
				<InputDatePicker v-model="endDate" :is-date-unavailable="(endDate) => isEndDateUnavailable(startDate, endDate)" />
				<UButton
					v-if="!isEndDateRequired && endDate"
					icon="lucide:x"
					variant="ghost"
					color="error"
					@click="endDate = ''"
				/>
			</div>
		</UFormField>
	</div>
</template>

<script setup lang="ts">
	const { isEndDateRequired = false } = defineProps<{
		isEndDateRequired?: boolean
	}>();

	const startDate = defineModel<string | undefined>("startDate", {
		required: true
	});

	const endDate = defineModel<string | undefined>("endDate", {
		required: false
	});
</script>
