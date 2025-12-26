<template>
	<UButton icon="lucide:plus" variant="outline" @click="showAddModal = true">
		<slot>
			New ferment
		</slot>
	</UButton>
	<UModal v-model:open="showAddModal" title="Add new ferment">
		<template #body>
			<FermentForm
				@submit="handleSubmit"
				@cancel="showAddModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { ActiveFerment, FermentBase } from "~/types/ferment";
	import { SchemaValidationError } from "@tanstack/vue-db";
	import { nanoid } from "nanoid";

	const toast = useToast();
	const showAddModal = ref(false);

	async function handleSubmit(data: Omit<FermentBase, "id" | "createdAt">) {
		try {
			const newFerment: ActiveFerment = {
				...data,
				id: nanoid(),
				state: "active",
				createdAt: data.updatedAt
			};
			FermentCollection.insert(newFerment);
			showAddModal.value = false;
		} catch (error) {
			const description = error instanceof SchemaValidationError ? z.prettifyError(error) : String(error);
			toast.add({ title: "Error saving ferment", description, color: "error" });
		}
	}
</script>
