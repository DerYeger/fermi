<template>
	<UForm :schema="CompletedFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<UFormField label="End date" name="endDate" required>
			<InputDatePicker
				v-model="state.endDate" :is-date-unavailable="(endDate) => isEndDateUnavailable(ferment.startDate, endDate)"
			/>
		</UFormField>
		<RatingFormFields
			v-for="rating of RATING_CATEGORIES"
			:key="rating.key"
			v-model:stars="state[rating.key].stars"
			v-model:notes="state[rating.key].notes"
			:label="rating.name"
			:name="rating.key"
			:placeholder="rating.placeholder"
		/>
		<FermentFormActions submit-label="Complete" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment, CompletedFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import RatingFormFields from "~/components/Forms/FormFields/RatingFormFields.vue";
	import { CompletedFermentSchema, RATING_CATEGORIES } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const emit = defineEmits<{
		submit: [data: CompletedFerment]
		cancel: []
	}>();

	const state = reactive<CompletedFerment>({
		...deepClone(ferment),
		state: "completed",
		endDate: ferment.endDate ?? getISODate(),
		overall: {
			stars: null,
			notes: ""
		},
		flavor: {
			stars: null,
			notes: ""
		},
		texture: {
			stars: null,
			notes: ""
		},
		smell: {
			stars: null,
			notes: ""
		},
		process: {
			stars: null,
			notes: ""
		}
	});

	function handleSubmit(event: FormSubmitEvent<CompletedFerment>) {
		emit("submit", event.data);
	}
</script>
