<template>
	<UTooltip :kbds="withShortcut ? ['meta', 'N'] : undefined" :content="{ side: 'bottom' }">
		<UButton icon="hugeicons:plus-sign" label="New ferment" variant="subtle" class="max-sm:[&>span.truncate]:hidden" @click="showAddModal = true" />
	</UTooltip>
	<UModal v-model:open="showAddModal" title="Create new ferment" description="Form for creating a new ferment">
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
	import NewFermentForm from "~/components/Forms/NewFermentForm/NewFermentForm.vue";
	import { getErrorMessage, sortImages } from "~/types/utils";

	const { withShortcut } = defineProps<{
		withShortcut?: boolean
	}>();

	const toast = useToast();
	const showAddModal = ref(false);

	if (withShortcut) {
		defineShortcuts({
			meta_n: () => {
				showAddModal.value = true;
			}
		});
	}

	async function handleSubmit(ferment: ActiveFerment) {
		try {
			FermentCollection.insert({
				...ferment,
				images: sortImages(ferment.images)
			});
			showAddModal.value = false;
			toast.add({
				title: "Ferment created",
				color: "success",
				actions: [{
					label: "View",
					variant: "subtle",
					to: `/ferments/${ferment.id}`
				}]
			});
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
