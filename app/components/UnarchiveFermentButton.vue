<template>
	<UButton
		:label="hideLabel ? undefined : 'Restore'"
		color="warning"
		variant="ghost"
		size="sm"
		icon="hugeicons:unarchive-03"
		@click.stop="showConfirmDialog = true"
	/>
	<UModal v-model:open="showConfirmDialog" title="Restore ferment">
		<template #body>
			<p class="text-muted mb-6">
				Are you sure you want to restore "{{ ferment.name }}"? This action will move it back to active ferments.
			</p>
			<div class="flex justify-end gap-2">
				<UButton variant="ghost" @click="showConfirmDialog = false">
					Cancel
				</UButton>
				<UButton variant="subtle" color="warning" @click="handleUnarchive">
					Restore
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { CompletedFerment } from "~/types/ferment";
	import { transitionToActive } from "~/types/ferment";
	import { getErrorMessage } from "~/types/utils";

	const { ferment } = defineProps<{
		ferment: CompletedFerment
		hideLabel?: boolean
	}>();

	const showConfirmDialog = ref(false);

  const route = useRoute();
  const toast = useToast();

  const emit = defineEmits<{
      beforeUnarchive: []
  }>();

	async function handleUnarchive() {
		if (ferment.state !== "completed") return;
    try {
      emit("beforeUnarchive");
			FermentCollection.update(ferment.id, (current) => {
				Object.assign(current, transitionToActive(ferment));
      });
      showConfirmDialog.value = false;
      toast.add({
				title: "Ferment restored",
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
			toast.add({ title: "Error restoring ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
