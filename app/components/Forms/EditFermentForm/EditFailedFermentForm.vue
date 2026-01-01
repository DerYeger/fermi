<template>
	<UForm :schema="FailedFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
		<div class="flex gap-4">
			<NameFormField v-model="state.name" />
			<ContainerFormField v-model="state.container" />
		</div>
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
		<FailureReasonFormField v-model="state.reason" />
		<FermentFormActions :submit-label="submitLabel" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { FailedFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import ContainerFormField from "~/components/Forms/FormFields/ContainerFormField.vue";
	import DateFormFields from "~/components/Forms/FormFields/DateFormFields.vue";
	import FailureReasonFormField from "~/components/Forms/FormFields/FailureReasonFormField.vue";
	import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
	import IngredientsFormField from "~/components/Forms/FormFields/IngredientsFormField.vue";
	import NameFormField from "~/components/Forms/FormFields/NameFormField.vue";
	import NotesFormField from "~/components/Forms/FormFields/NotesFormField.vue";
	import SaltRatioFormField from "~/components/Forms/FormFields/SaltRatioFormField.vue";
	import { FailedFermentSchema } from "~/types/ferment";
	import { deepClone } from "~/types/utils";

	const { ferment, submitLabel = "Update" } = defineProps<{
		ferment: FailedFerment
		submitLabel?: string
	}>();

	const emit = defineEmits<{
		submit: [ferment: FailedFerment]
		cancel: []
	}>();

	const state = reactive<FailedFerment>(deepClone(ferment));

	function handleSubmit(event: FormSubmitEvent<FailedFerment>) {
		emit("submit", event.data);
	};
</script>
