<template>
	<UButton
		variant="ghost"
		size="sm"
		icon="hugeicons:copy-01"
		:label="hideLabel ? undefined : 'Duplicate'"
		@click.stop="showDuplicationModal = true"
	/>
	<UModal
		v-model:open="showDuplicationModal"
		title="Duplicate ferment"
		description="Form for duplicating an existing ferment"
	>
		<template #body>
			<EditActiveFermentForm
				v-if="duplicationBase.state === 'active'"
				:ferment="duplicationBase"
				submit-label="Duplicate"
				@submit="handleSubmit"
				@cancel="showDuplicationModal = false"
			/>
			<EditCompletedFermentForm
				v-else-if="duplicationBase.state === 'completed'"
				:ferment="duplicationBase"
				submit-label="Duplicate"
				@submit="handleSubmit"
				@cancel="showDuplicationModal = false"
			/>
			<EditFailedFermentForm
				v-else
				:ferment="duplicationBase"
				submit-label="Duplicate"
				@submit="handleSubmit"
				@cancel="showDuplicationModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import EditActiveFermentForm from "~/components/Forms/EditFermentForm/EditActiveFermentForm.vue";
	import EditCompletedFermentForm from "~/components/Forms/EditFermentForm/EditCompletedFermentForm.vue";
	import EditFailedFermentForm from "~/components/Forms/EditFermentForm/EditFailedFermentForm.vue";
	import { getErrorMessage, sortImages } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: Ferment
		hideLabel?: boolean
	}>();

	const duplicationBase = computed<Ferment>(() => {
		const nowDatetime = getISODatetime();
		return { ...ferment, id: createId(), createdAt: nowDatetime, updatedAt: nowDatetime };
	});

	const toast = useToast();
	const showDuplicationModal = ref(false);

	async function handleSubmit(data: Ferment) {
		try {
			FermentCollection.insert({
				...data,
				images: sortImages(data.images)
			});
			showDuplicationModal.value = false;
			toast.add({
				title: "Ferment duplicated",
				color: "success",
				actions: [{
					label: "View",
					variant: "subtle",
					to: `/ferments/${data.id}`
				}]
			});
		} catch (error) {
			toast.add({ title: "Error duplicating ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
