<template>
	<UTooltip :kbds="withShortcut ? ['meta', 'N'] : undefined" :content="{ side: 'bottom' }">
		<UButton icon="lucide:plus" label="New ferment" variant="subtle" @click="showAddModal = true" />
	</UTooltip>
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
	import NewFermentForm from "~/components/Forms/NewFermentForm/NewFermentForm.vue";
	import { getErrorMessage } from "~/types/utils";

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
				images: ferment.images.sort((a, b) => a.date.localeCompare(b.date))
			});
			showAddModal.value = false;
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
