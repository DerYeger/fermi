<template>
	<UForm :schema="CompletedFermentSchema" :state="state" class="flex flex-col gap-6" @submit="handleSubmit">
		<NameFormField v-model="state.name" />
		<ImagesFormField v-model="state.images" />
		<SaltRatioFormField v-model="state.saltRatio" />
		<IngredientsFormField v-model="state.ingredients" />
		<DatesFormField
			v-model:start-date="state.startDate"
			v-model:end-date="state.endDate"
			is-end-date-required
		/>
		<NotesFormField
			v-model="state.notes"
		/>
		<FermentFormActions submit-label="Update" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { CompletedFerment } from "~/types/ferment";
	import { CompletedFermentSchema } from "~/types/ferment";

	// TODO: Add form fields for completed ferment specific data

	const { ferment } = defineProps<{
		ferment: CompletedFerment
	}>();

	const emit = defineEmits<{
		submit: [ferment: CompletedFerment]
		cancel: []
	}>();

	const state = reactive<CompletedFerment>(JSON.parse(JSON.stringify(ferment)));

	function handleSubmit(event: FormSubmitEvent<CompletedFerment>) {
		emit("submit", event.data);
	};
</script>
