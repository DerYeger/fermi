<template>
	<UForm :schema="FailedFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<UFormField label="End date" name="endDate" required>
			<InputDatePicker
				v-model="state.endDate" :is-date-unavailable="(endDate) => isEndDateUnavailable(ferment.startDate, endDate)"
			/>
		</UFormField>
		<ImagesFormField v-model="state.images" />
		<FailureReasonFormField v-model="state.reason" />
		<FermentFormActions submit-label="Complete" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment, FailedFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import FailureReasonFormField from "~/components/Forms/FormFields/FailureReasonFormField.vue";
	import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
	import { FailedFermentSchema } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const emit = defineEmits<{
		submit: [data: FailedFerment]
		cancel: []
	}>();

	const state = reactive<FailedFerment>({
		...deepClone(ferment),
		state: "failed",
		endDate: ferment.endDate ?? getISODate(),
		reason: ""
	});

	function handleSubmit(event: FormSubmitEvent<FailedFerment>) {
		emit("submit", event.data);
	}
</script>
