<template>
	<UButton
		variant="ghost"
		size="sm"
		icon="lucide:trash-2"
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

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const showConfirmDialog = ref(false);

	const route = useRoute();

	async function handleDelete() {
		if (route.name === "ferment-id" && route.params.id === ferment.id) {
			await useRouter().push({ name: "ferments" }); // Navigate away if currently viewing the ferment being deleted
		}
		showConfirmDialog.value = false;
		FermentCollection.delete(ferment.id);
	}
</script>
