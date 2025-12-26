<template>
	<UButton variant="ghost" size="sm" icon="lucide:pencil" @click.stop="showEditModal = true">
		Edit
	</UButton>
	<UModal
		v-model:open="showEditModal"
		title="Edit ferment"
	>
		<template #body>
			<EditActiveFermentForm
				v-if="ferment.state === 'active'"
				:ferment="ferment"
				@submit="handleSubmit"
				@cancel="showEditModal = false"
			/>
			<EditCompletedFermentForm
				v-else
				:ferment="ferment"
				@submit="handleSubmit"
				@cancel="showEditModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import { SchemaValidationError } from "@tanstack/vue-db";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const showEditModal = ref(false);

	const toast = useToast();

	async function handleSubmit(data: Ferment) {
		try {
			FermentCollection.update(ferment.id, (current) => {
				Object.assign(current, data, { updatedAt: getISODatetime() });
			});
			showEditModal.value = false;
		} catch (error) {
			const description = error instanceof SchemaValidationError ? z.prettifyError(error) : String(error);
			toast.add({ title: "Error updating ferment", description, color: "error" });
		}
	}
</script>
