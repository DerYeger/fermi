<template>
	<UButton
		:label="hideLabel ? undefined : 'Restore'"
		variant="ghost"
		size="sm"
		icon="lucide:archive-restore"
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
				<UButton variant="subtle" color="success" @click="handleUnarchive">
					Restore
				</UButton>
			</div>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { CompletedFerment } from "~/types/ferment";
	import { transitionToActive } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: CompletedFerment
		hideLabel?: boolean
	}>();

	const showConfirmDialog = ref(false);

	async function handleUnarchive() {
		if (ferment.state !== "completed") return;
		FermentCollection.update(ferment.id, (current) => {
			Object.assign(current, transitionToActive(ferment));
		});
	}
</script>
