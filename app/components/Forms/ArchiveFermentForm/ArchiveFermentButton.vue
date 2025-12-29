<template>
	<UButton
		variant="ghost"
		size="sm"
		color="warning"
		icon="hugeicons:archive-03"
		@click.stop="showArchiveModal = true"
	>
		Complete
	</UButton>
	<UModal v-model:open="showArchiveModal" title="Complete ferment">
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
	import { getErrorMessage } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const showArchiveModal = ref(false);
	const toast = useToast();

	async function handleArchive(data: CompletedFerment) {
		try {
			FermentCollection.update(data.id, (draft) => {
				Object.assign(draft, data, { updatedAt: getISODatetime() });
			});
			showArchiveModal.value = false;
		} catch (error) {
			toast.add({ title: "Error completing ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
