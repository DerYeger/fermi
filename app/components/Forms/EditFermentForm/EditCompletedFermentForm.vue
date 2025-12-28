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
			v-for="rating of RATING_CATEGORIES"
			:key="rating.key"
			v-model:stars="state[rating.key].stars"
			v-model:notes="state[rating.key].notes"
			:label="rating.name"
			:name="rating.key"
			:placeholder="rating.placeholder"
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
	import { CompletedFermentSchema, RATING_CATEGORIES } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

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
