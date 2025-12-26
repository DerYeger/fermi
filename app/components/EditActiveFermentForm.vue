<template>
	<UForm :schema="ActiveFermentSchema" :state="state" class="flex flex-col gap-6" @submit="handleSubmit">
		<NameFormField v-model="state.name" />
		<ImagesFormField v-model="state.images" />
		<SaltRatioFormField v-model="state.saltRatio" />
		<IngredientsFormField v-model="state.ingredients" />
		<DatesFormField
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
	import { ActiveFermentSchema } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const emit = defineEmits<{
		submit: [ferment: ActiveFerment]
		cancel: []
	}>();

	const state = reactive<ActiveFerment>(JSON.parse(JSON.stringify(ferment)));

	function handleSubmit(event: FormSubmitEvent<ActiveFerment>) {
		emit("submit", event.data);
	};
</script>
