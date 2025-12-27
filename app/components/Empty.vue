<template>
	<div class="size-full flex-center">
		<UEmpty :title="title" :description="description" variant="naked">
			<template #actions>
				<NewFermentButton />
				<UButton
					v-if="type === 'completed'"
					variant="subtle"
					label="See active ferments"
					@click="navigateTo('/ferments')"
				/>
			</template>
		</UEmpty>
	</div>
</template>

<script lang="ts" setup>
	import type { FermentState } from "~/types/ferment";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const { type } = defineProps<{
		type: FermentState | "all"
	}>();

	const title = computed(() => {
		if (type === "active") {
			return "No active ferments";
		} else if (type === "completed") {
			return "No completed ferments";
		} else {
			return "No ferments";
		}
	});

	const description = computed(() => {
		if (type === "active") {
			return "Active ferments will appear here.";
		} else if (type === "completed") {
			return "Completed ferments will appear here.";
		} else {
			return "Create your first ferment to get started.";
		}
	});
</script>
