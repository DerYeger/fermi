<template>
	<UButton
		variant="ghost"
		size="sm"
		icon="hugeicons:delete-02"
		color="error"
		@click.stop="showConfirmDialog = true"
	/>
	<UModal v-model:open="showConfirmDialog" title="Delete ferment">
		<template #body>
			<p class="text-muted mb-6">
				Are you sure you want to delete "{{ ferment.name }}"? This action cannot be undone.
			</p>
			<div class="flex justify-end gap-2">
				<UButton variant="ghost" @click="showConfirmDialog = false">
					Cancel
				</UButton>
				<UButton variant="subtle" color="error" @click="handleDelete">
					Delete
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

	const showConfirmDialog = ref(false);

	const route = useRoute();
	const toast = useToast();

	async function handleDelete() {
		try {
			if (route.name === "ferments-id" && route.params.id === ferment.id) {
				await useRouter().push({ name: "ferments" }); // Navigate away if currently viewing the ferment being deleted
			}
			showConfirmDialog.value = false;
			FermentCollection.delete(ferment.id);
		} catch (error) {
			toast.add({ title: "Error deleting ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
