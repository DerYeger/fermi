<template>
	<UButton
		variant="ghost"
		color="warning"
		size="sm"
		icon="hugeicons:archive-03"
		:label="hideLabel ? undefined : 'Complete'"
		@click.stop="showArchiveModal = true"
	/>
	<UModal v-model:open="showArchiveModal" title="Complete ferment" description="Form for completing an active ferment">
		<template #body>
			<ArchiveForm
				:ferment="ferment"
				@submit="handleArchive"
				@cancel="showArchiveModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { ActiveFerment, CompletedFerment } from "~/types/ferment";
	import ArchiveForm from "~/components/Forms/ArchiveFermentForm/ArchiveForm.vue";
	import { getErrorMessage, sortImages } from "~/types/utils";

	const { ferment, hideLabel = false } = defineProps<{
		ferment: ActiveFerment
		hideLabel?: boolean
	}>();

	const showArchiveModal = ref(false);
	const toast = useToast();

	const route = useRoute();

	async function handleArchive(data: CompletedFerment) {
		try {
			FermentCollection.update(data.id, (draft) => {
				Object.assign(draft, {
					...data,
					images: sortImages(data.images)
				}, { updatedAt: getISODatetime() });
			});
			showArchiveModal.value = false;
			toast.add({
				title: "Ferment completed",
				color: "success",
				actions: route.name === "ferments-id" && route.params.id === ferment.id
					? undefined
					: [{
						label: "View",
						variant: "subtle",
						to: `/ferments/${ferment.id}`
					}]
			});
		} catch (error) {
			toast.add({ title: "Error completing ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
