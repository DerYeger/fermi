<template>
	<UButton
		variant="ghost"
		color="warning"
		size="sm"
		icon="hugeicons:waste"
		:label="hideLabel ? undefined : 'Fail'"
		@click.stop="showFailModal = true"
	/>
	<UModal v-model:open="showFailModal" title="Fail ferment" description="Form for failing an active ferment">
		<template #body>
			<FailForm
				:ferment="ferment"
				@submit="handleFail"
				@cancel="showFailModal = false"
			/>
		</template>
	</UModal>
</template>

<script lang="ts" setup>
	import type { ActiveFerment, FailedFerment } from "~/types/ferment";
	import FailForm from "~/components/Forms/FailFermentForm/FailForm.vue";
	import { getErrorMessage, sortImages } from "~/types/utils";

	const { ferment, hideLabel = false } = defineProps<{
		ferment: ActiveFerment
		hideLabel?: boolean
	}>();

	const showFailModal = ref(false);
	const toast = useToast();

	const route = useRoute();

	async function handleFail(data: FailedFerment) {
		try {
			FermentCollection.update(data.id, (draft) => {
				Object.assign(draft, {
					...data,
					images: sortImages(data.images)
				}, { updatedAt: getISODatetime() });
			});
			showFailModal.value = false;
			toast.add({
				title: "Ferment failed",
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
			toast.add({ title: "Error failing ferment", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
