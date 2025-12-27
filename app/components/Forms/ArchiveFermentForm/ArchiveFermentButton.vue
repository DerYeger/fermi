<template>
	<UButton
		variant="ghost"
		size="sm"
		icon="lucide:archive"
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

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const showArchiveModal = ref(false);

	async function handleArchive(data: CompletedFerment) {
		FermentCollection.update(data.id, (draft) => {
			Object.assign(draft, data, { updatedAt: getISODatetime() });
		});
		showArchiveModal.value = false;
	}
</script>
