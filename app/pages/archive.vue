<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
	</div>

	<div v-else-if="data.length === 0" class="text-center py-12">
		<UIcon name="lucide:flask-conical" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
		<p class="text-(--ui-text-muted) mb-4">
			No archived ferments yet
		</p>
		<NewFermentButton>
			Start Your First Ferment
		</NewFermentButton>
	</div>

	<div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<FermentCard
			v-for="ferment in data"
			:key="ferment.id"
			:ferment="ferment"
		/>
	</div>
</template>

<script setup lang="ts">
	const { data, isLoading } = useCompletedFerments();
</script>
