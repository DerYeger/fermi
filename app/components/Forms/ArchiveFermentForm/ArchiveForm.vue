<template>
	<UForm :schema="CompletedFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<p class="text-muted">
			Mark "{{ ferment.name }}" as complete. Rate your ferment and add any final notes.
		</p>
		<UFormField label="End date" name="endDate" required>
			<InputDatePicker
				v-model="state.endDate" :is-date-unavailable="(endDate) => isEndDateUnavailable(ferment.startDate, endDate)"
			/>
		</UFormField>
		<RatingFormFields
			v-model:stars="state.overall.stars"
			v-model:notes="state.overall.notes"
			label="Overall"
			name="overall"
		/>
		<RatingFormFields
			v-model:stars="state.flavor.stars"
			v-model:notes="state.flavor.notes"
			label="Flavor"
			name="flavor"
		/>
		<RatingFormFields
			v-model:stars="state.texture.stars"
			v-model:notes="state.texture.notes"
			label="Texture"
			name="texture"
		/>
		<RatingFormFields
			v-model:stars="state.process.stars"
			v-model:notes="state.process.notes"
			label="Process"
			name="process"
		/>
		<FermentFormActions submit-label="Complete" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment, CompletedFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import RatingFormFields from "~/components/Forms/FormFields/RatingFormFields.vue";
	import { CompletedFermentSchema } from "~/types/ferment";
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
		process: {
			stars: null,
			notes: ""
		}
	});

	function handleSubmit(event: FormSubmitEvent<CompletedFerment>) {
		emit("submit", event.data);
	}
</script>
