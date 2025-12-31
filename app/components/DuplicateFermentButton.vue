<template>
	<UButton variant="ghost" size="sm" icon="hugeicons:copy-01" @click.stop="showConfirmDialog = true" />
	<UModal v-model:open="showConfirmDialog" title="Duplicate ferment" description="Dialog for duplicating an existing ferment">
		<template #body>
			<p class="text-muted mb-6">
				Are you sure you want to duplicate "{{ ferment.name }}"?
			</p>
			<div class="flex justify-end gap-2">
				<UButton variant="ghost" color="neutral" @click="showConfirmDialog = false">
					Cancel
				</UButton>
				<UButton variant="subtle" @click="handleDuplicate">
					Duplicate
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import { getErrorMessage } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const toast = useToast();
	const showConfirmDialog = ref(false);

	async function handleDuplicate() {
		try {
			const newId = createId();
			FermentCollection.insert({
				...ferment,
				id: newId
			});
			showConfirmDialog.value = false;
			toast.add({
				title: "Ferment duplicated",
				color: "success",
				actions: [{
					label: "View",
					variant: "subtle",
					to: `/ferments/${newId}`
				}]
			});
		} catch (error) {
			toast.add({ title: "Error duplicating ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
