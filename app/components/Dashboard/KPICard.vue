<template>
	<UCard>
		<template #header>
			<CardHeader title="Overview" icon="hugeicons:analytics-up" />
		</template>
		<Loader v-if="activeFerments.isLoading.value || completedFerments.isLoading.value" />
		<div v-if="!activeFerments.data.value?.length && !completedFerments.data.value?.length" class="p-4 flex-center text-sm text-muted">
			No ferments
		</div>
		<div class="grid sm:grid-cols-3 gap-2">
			<div class="flex flex-col items-center">
				<div class="text-2xl font-semibold">
					{{ activeFerments.data.value.length + completedFerments.data.value.length }}
				</div>
				<div class="text-sm text-muted">
					Total
				</div>
			</div>
			<div class="flex flex-col items-center">
				<div class="text-2xl font-semibold">
					{{ activeFerments.data.value.length }}
				</div>
				<div class="text-sm text-muted">
					Active
				</div>
			</div>
			<div class="flex flex-col items-center">
				<div class="text-2xl font-semibold">
					{{ completedFerments.data.value.length }}
				</div>
				<div class="text-sm text-muted">
					Completed
				</div>
			</div>
		</div>
	</UCard>
</template>

<script setup lang="ts">
	const activeFerments = useActiveFerments();
	const completedFerments = useCompletedFerments();
</script>
