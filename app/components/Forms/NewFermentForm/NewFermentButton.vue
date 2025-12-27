<template>
	<UButton icon="lucide:plus" variant="subtle" label="New ferment" @click="showAddModal = true" />
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

	const toast = useToast();
	const showAddModal = ref(false);

	async function handleSubmit(ferment: ActiveFerment) {
		try {
			FermentCollection.insert(ferment);
			showAddModal.value = false;
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
