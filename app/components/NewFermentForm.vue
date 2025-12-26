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
		<FermentFormActions submit-label="Create" @cancel="emit('cancel')" />
	</UForm>
</template>

<script lang="ts" setup>
	import type { FormSubmitEvent } from "@nuxt/ui";
	import type { ActiveFerment } from "~/types/ferment";
	import { nanoid } from "nanoid";
	import { getISODate } from "~/composables/useTime";
	import { ActiveFermentSchema } from "~/types/ferment";

	const emit = defineEmits<{
		submit: [ferment: ActiveFerment]
		cancel: []
	}>();

	const now = new Date();

	const state = reactive<ActiveFerment>({
		id: nanoid(),
		name: "",
		images: [],
		ingredients: [],
		saltRatio: 2,
		notes: "",
		startDate: getISODate(now),
		endDate: undefined,
		createdAt: getISODatetime(now),
		updatedAt: getISODatetime(now),
		state: "active"
	});

	function handleSubmit(event: FormSubmitEvent<ActiveFerment>) {
		emit("submit", event.data);
	};
</script>
