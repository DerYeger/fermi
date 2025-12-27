<template>
	<UCard class="cursor-pointer" @click="navigateToDetails">
		<template #header>
			<CardHeader :title="ferment.name" />
		</template>

		<div class="flex flex-col gap-2 text-sm text-muted">
			<!-- Image -->
			<div class="mb-2 w-full overflow-hidden rounded-lg">
				<div v-if="ferment.images.length > 0" class="aspect-video">
					<img
						:src="ferment.images[0]!.base64"
						:alt="ferment.name"
						class="size-full object-cover"
					>
				</div>
				<div v-else class="aspect-video bg-elevated flex-center">
					<UIcon name="lucide:salad" class="size-12" />
				</div>
			</div>

			<!-- Salt ratio -->
			<div class="flex items-center gap-2">
				<UIcon name="lucide:gem" class="size-4" />
				<span>{{ ferment.saltRatio }}% salt</span>
			</div>

			<!-- Days fermenting -->
			<div v-if="ferment.state === 'active'" class="flex items-center gap-2">
				<UIcon name="lucide:clock" class="size-4" />
				<span>{{ formatTimeSince(ferment.startDate) }}</span>
			</div>

			<!-- Dates -->
			<div class="flex items-center gap-2">
				<UIcon name="lucide:calendar" class="size-4" />
				<span>Started {{ formatDate(ferment.startDate) }}</span>
			</div>
			<div class="flex items-center gap-2">
				<UIcon name="lucide:calendar-check" class="size-4" />
				<span v-if="ferment.endDate" class="flex items-center gap-2">
					Ends {{ formatDate(ferment.endDate) }}
					<UBadge v-if="isFermentOverdue(ferment)" color="warning" variant="subtle" class="-my-1">Overdue</UBadge>
				</span>
				<span v-else>No end date</span>
			</div>

			<!-- Ingredients preview -->
			<div v-if="ferment.ingredients.length > 0" class="mt-2">
				<div class="flex flex-wrap gap-1">
					<UBadge
						v-for="ingredient in ferment.ingredients.slice(0, 3)"
						:key="ingredient.id"
						variant="subtle"
					>
						{{ ingredient.name }}
					</UBadge>
					<UBadge
						v-if="ferment.ingredients.length > 3"
						variant="subtle"
					>
						+{{ ferment.ingredients.length - 3 }} more
					</UBadge>
				</div>
			</div>
		</div>
		<template #footer>
			<div class="flex gap-2">
				<EditFermentButton :ferment="ferment" />
				<ArchiveFermentButton :ferment="ferment" />
				<DeleteFermentButton :ferment="ferment" />
			</div>
		</template>
	</UCard>
</template>

<script lang="ts" setup>
	import type { ActiveFerment } from "~/types/ferment";
	import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	function navigateToDetails() {
		navigateTo({ name: "ferment-id", params: { id: ferment.id } });
	}
</script>
