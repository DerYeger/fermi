<template>
	<UForm :schema="CompletedFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<NameFormField v-model="state.name" />
		<ImagesFormField v-model="state.images" />
		<SaltRatioFormField v-model="state.saltRatio" />
		<IngredientsFormField v-model="state.ingredients" />
		<DateFormFields
			v-model:start-date="state.startDate"
			v-model:end-date="state.endDate"
			is-end-date-required
		/>
		<NotesFormField
			v-model="state.notes"
		/>
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
		<FermentFormActions submit-label="Update" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { CompletedFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import DateFormFields from "~/components/Forms/FormFields/DateFormFields.vue";
	import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
	import IngredientsFormField from "~/components/Forms/FormFields/IngredientsFormField.vue";
	import NameFormField from "~/components/Forms/FormFields/NameFormField.vue";
	import NotesFormField from "~/components/Forms/FormFields/NotesFormField.vue";
	import RatingFormFields from "~/components/Forms/FormFields/RatingFormFields.vue";
	import SaltRatioFormField from "~/components/Forms/FormFields/SaltRatioFormField.vue";
	import { CompletedFermentSchema } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

	// TODO: Add form fields for completed ferment specific data

	const { ferment } = defineProps<{
		ferment: CompletedFerment
	}>();

	const emit = defineEmits<{
		submit: [ferment: CompletedFerment]
		cancel: []
	}>();

	const state = reactive<CompletedFerment>(deepClone(ferment));

	function handleSubmit(event: FormSubmitEvent<CompletedFerment>) {
		emit("submit", event.data);
	};
</script>
