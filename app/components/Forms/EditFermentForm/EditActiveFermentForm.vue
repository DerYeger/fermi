<template>
	<UForm :schema="ActiveFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<NameFormField v-model="state.name" />
		<ImagesFormField v-model="state.images" />
		<SaltRatioFormField v-model="state.saltRatio" />
		<IngredientsFormField v-model="state.ingredients" />
		<DateFormFields
			v-model:start-date="state.startDate"
			v-model:end-date="state.endDate"
		/>
		<NotesFormField
			v-model="state.notes"
		/>
		<FermentFormActions submit-label="Update" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import DateFormFields from "~/components/Forms/FormFields/DateFormFields.vue";
	import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
	import IngredientsFormField from "~/components/Forms/FormFields/IngredientsFormField.vue";
	import NameFormField from "~/components/Forms/FormFields/NameFormField.vue";
	import NotesFormField from "~/components/Forms/FormFields/NotesFormField.vue";
	import SaltRatioFormField from "~/components/Forms/FormFields/SaltRatioFormField.vue";
	import { ActiveFermentSchema } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const emit = defineEmits<{
		submit: [ferment: ActiveFerment]
		cancel: []
	}>();

	const state = reactive<ActiveFerment>(deepClone(ferment));

	function handleSubmit(event: FormSubmitEvent<ActiveFerment>) {
		emit("submit", event.data);
	};
</script>
