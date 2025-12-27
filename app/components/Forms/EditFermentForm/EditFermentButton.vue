<template>
	<UButton :label="hideLabel ? undefined : 'Edit'" variant="ghost" size="sm" icon="lucide:pencil" @click.stop="showEditModal = true" />
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
	import EditActiveFermentForm from "~/components/Forms/EditFermentForm/EditActiveFermentForm.vue";
	import EditCompletedFermentForm from "~/components/Forms/EditFermentForm/EditCompletedFermentForm.vue";
	import { getErrorMessage } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: Ferment
		hideLabel?: boolean
	}>();

	const showEditModal = ref(false);

	const toast = useToast();

	async function handleSubmit(data: Ferment) {
		try {
			FermentCollection.update(ferment.id, (current) => {
				Object.assign(current, {
					...data,
					images: data.images.sort((a, b) => a.date.localeCompare(b.date))
				}, { updatedAt: getISODatetime() });
				if (data.state === "active" && !data.endDate) {
					current.endDate = undefined;
				}
			});
			showEditModal.value = false;
		} catch (error) {
			toast.add({ title: "Error updating ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
