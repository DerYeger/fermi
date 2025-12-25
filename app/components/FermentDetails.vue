<template>
	<div>
		<!-- Header -->
		<div class="flex items-start justify-between gap-4 mb-6">
			<div>
				<h1 class="text-2xl font-bold">
					{{ ferment.name }}
				</h1>
				<div class="flex items-center gap-2 mt-1">
					<UBadge v-if="ferment.state === 'completed'" variant="subtle" color="neutral">
						Archived
					</UBadge>
					<span class="text-sm text-(--ui-text-muted)">
						{{ daysFermenting }}
					</span>
				</div>
			</div>

			<div class="flex items-center gap-2">
				<EditFermentButton :ferment="ferment" />
				<ArchiveFermentButton v-if="ferment.state === 'active'" :ferment="ferment" />
				<UnarchiveFermentButton v-else :ferment="ferment" />
				<DeleteFermentButton :ferment="ferment" />
			</div>
		</div>

		<!-- Content -->
		<div class="grid gap-6 lg:grid-cols-3">
			<!-- Main content -->
			<div class="lg:col-span-2 space-y-6">
				<!-- Image -->
				<UCard v-if="ferment.imagePaths.length > 0">
					<img
						:src="ferment.imagePaths[0]"
						:alt="ferment.name"
						class="w-full max-h-96 object-cover rounded-lg"
					>
				</UCard>

				<!-- Notes -->
				<UCard v-if="ferment.notes">
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="lucide:notebook-pen" class="size-5" />
							<h2 class="font-semibold">
								Notes
							</h2>
						</div>
					</template>
					<p class="whitespace-pre-wrap">
						{{ ferment.notes }}
					</p>
				</UCard>

				<!-- Completion Notes (for completed) -->
				<UCard v-if="ferment.state === 'completed' && ferment.overall.notes">
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="lucide:clipboard-check" class="size-5" />
							<h2 class="font-semibold">
								Completion Notes
							</h2>
						</div>
					</template>
					<p class="whitespace-pre-wrap">
						{{ ferment.overall.notes }}
					</p>
				</UCard>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Rating (for completed) -->
				<UCard v-if="ferment.state === 'completed' && ferment.overall.stars">
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="lucide:star" class="size-5" />
							<h2 class="font-semibold">
								Rating
							</h2>
						</div>
					</template>
					<div class="flex items-center gap-1">
						<UIcon
							v-for="i in 5"
							:key="i"
							name="lucide:star"
							:class="i <= ferment.overall.stars ? 'text-yellow-500' : 'text-(--ui-text-muted)'"
							class="size-6"
						/>
					</div>
				</UCard>

				<!-- Details -->
				<UCard>
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="lucide:info" class="size-5" />
							<h2 class="font-semibold">
								Details
							</h2>
						</div>
					</template>
					<div class="space-y-4">
						<div>
							<div class="text-sm text-(--ui-text-muted) mb-1">
								Salt Ratio
							</div>
							<div class="font-medium">
								{{ ferment.saltRatio }}%
							</div>
						</div>
						<div>
							<div class="text-sm text-(--ui-text-muted) mb-1">
								Start Date
							</div>
							<div class="font-medium">
								{{ formatDate(ferment.startDate) }}
							</div>
						</div>
						<div v-if="ferment.endDate">
							<div class="text-sm text-(--ui-text-muted) mb-1">
								End Date
							</div>
							<div class="font-medium">
								{{ formatDate(ferment.endDate) }}
							</div>
						</div>
						<div>
							<div class="text-sm text-(--ui-text-muted) mb-1">
								Created
							</div>
							<div class="font-medium">
								{{ formatDateTime(ferment.createdAt) }}
							</div>
						</div>
						<div>
							<div class="text-sm text-(--ui-text-muted) mb-1">
								Last Updated
							</div>
							<div class="font-medium">
								{{ formatDateTime(ferment.updatedAt) }}
							</div>
						</div>
					</div>
				</UCard>

				<!-- Ingredients -->
				<UCard v-if="ferment.ingredients.length > 0">
					<template #header>
						<div class="flex items-center gap-2">
							<UIcon name="lucide:list" class="size-5" />
							<h2 class="font-semibold">
								Ingredients
							</h2>
						</div>
					</template>
					<div class="space-y-2">
						<div
							v-for="ingredient in ferment.ingredients"
							:key="ingredient.id"
							class="flex items-center justify-between py-2 border-b border-(--ui-border) last:border-0"
						>
							<span class="font-medium">{{ ingredient.name }}</span>
							<span v-if="ingredient.amount" class="text-sm text-(--ui-text-muted)">
								{{ ingredient.amount }} {{ ingredient.unit }}
							</span>
						</div>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();

	const daysFermenting = useTimeSince(() => ferment.startDate);
</script>
