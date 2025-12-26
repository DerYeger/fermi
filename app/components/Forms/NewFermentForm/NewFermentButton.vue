<template>
	<UButton icon="lucide:plus" variant="outline" @click="showAddModal = true">
		<slot>
			New ferment
		</slot>
	</UButton>
	<UModal v-model:open="showAddModal" title="Add new ferment">
		<template #body>
			<NewFermentForm
				@submit="handleSubmit"
				@cancel="showAddModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { ActiveFerment } from "~/types/ferment";
	import { SchemaValidationError } from "@tanstack/vue-db";
	import NewFermentForm from "~/components/Forms/NewFermentForm/NewFermentForm.vue";

	const toast = useToast();
	const showAddModal = ref(false);

	async function handleSubmit(ferment: ActiveFerment) {
		try {
			FermentCollection.insert(ferment);
			showAddModal.value = false;
		} catch (error) {
			const description = error instanceof SchemaValidationError ? z.prettifyError(error) : String(error);
			toast.add({ title: "Error saving ferment", description, color: "error" });
		}
	}
</script>
