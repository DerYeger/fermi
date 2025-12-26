<template>
	<UButton variant="ghost" size="sm" icon="lucide:pencil" @click.stop="showEditModal = true">
		Edit
	</UButton>
	<UModal
		v-model:open="showEditModal" title="Edit ferment"
	>
		<template #body>
			<FermentForm
				:initial-data="ferment"
				@submit="handleSubmit"
				@cancel="showEditModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { Ferment, FermentBase } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const showEditModal = ref(false);

	const toast = useToast();

	async function handleSubmit(data: Omit<FermentBase, "id" | "createdAt">) {
		try {
			FermentCollection.update(ferment.id, (current) => {
				Object.assign(current, data);
			});
			showEditModal.value = false;
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: String(error), color: "error" });
		}
	}
</script>
