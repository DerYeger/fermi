<template>
	<UForm :schema="ActiveFermentSchema" :state="state" class="flex flex-col gap-8" @submit="handleSubmit">
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
		/>
		<NotesFormField
			v-model="state.notes"
		/>
		<FermentFormActions submit-label="Create" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment } from "~/types/ferment";
	import FermentFormActions from "~/components/Forms/FermentFormActions.vue";
	import ContainerFormField from "~/components/Forms/FormFields/ContainerFormField.vue";
	import DateFormFields from "~/components/Forms/FormFields/DateFormFields.vue";
	import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
	import IngredientsFormField from "~/components/Forms/FormFields/IngredientsFormField.vue";
	import NameFormField from "~/components/Forms/FormFields/NameFormField.vue";
	import NotesFormField from "~/components/Forms/FormFields/NotesFormField.vue";
	import SaltRatioFormField from "~/components/Forms/FormFields/SaltRatioFormField.vue";
	import { getISODate } from "~/composables/useTime";
	import { ActiveFermentSchema } from "~/types/ferment";

	const emit = defineEmits<{
		submit: [ferment: ActiveFerment]
		cancel: []
	}>();

	const state = reactive<ActiveFerment>({
		id: createId(),
		name: "",
		container: "",
		images: [],
		ingredients: [],
		saltRatio: 0.02,
		notes: "",
		startDate: getISODate(),
		endDate: null,
		createdAt: getISODatetime(),
		updatedAt: getISODatetime(),
		state: "active",
		isFavorite: false
	});

	function handleSubmit(event: FormSubmitEvent<ActiveFerment>) {
		emit("submit", event.data);
	};
</script>
