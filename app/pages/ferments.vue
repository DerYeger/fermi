<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-muted" />
	</div>

	<UEmpty v-else-if="data.length === 0" title="No active ferments" description="Active ferments will appear here." variant="naked">
		<template #actions>
			<NewFermentButton>
				Create new ferment
			</NewFermentButton>
		</template>
	</UEmpty>

	<div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<FermentCard
			v-for="ferment in data"
			:key="ferment.id"
			:ferment="ferment as ActiveFerment"
		/>
	</div>
</template>

<script lang="ts" setup>
	import type { ActiveFerment } from "~/types/ferment";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const { data, isLoading } = useActiveFerments();
</script>
