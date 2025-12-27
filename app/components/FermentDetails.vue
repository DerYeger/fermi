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
					<span class="text-sm text-muted">
						{{ formatTimeSince(ferment.startDate) }}
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
				<UCarousel
					v-slot="{ item }"
					:items="ferment.images"
					:class="{ 'mb-12': ferment.images.length > 3 }"
					:dots="ferment.images.length > 3"
					:prev="{ variant: 'solid' }" :next="{ variant: 'solid' }"
					:ui="{ item: 'basis-1/3 ps-2 rounded-lg my-auto relative', container: 'ms-0' }"
				>
					<img :src="item.base64" :alt="`Ferment Image taken on ${item.date}`" :width="480" :height="480">
					<div class="absolute left-0 right-0 bottom-0 p-1 flex justify-center">
						<UBadge color="neutral" variant="subtle">
							{{ ferment.startDate <= item.date ? formatTimeSince(ferment.startDate, item.date) : formatDate(item.date) }}
						</UBadge>
					</div>
				</UCarousel>

				<!-- Notes -->
				<UCard v-if="ferment.notes">
					<template #header>
						<CardHeader title="Notes" icon="lucide:notebook-pen" />
					</template>
					<p class="whitespace-pre-wrap">
						{{ ferment.notes }}
					</p>
				</UCard>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6">
				<!-- Details -->
				<UCard>
					<template #header>
						<CardHeader title="Details" icon="lucide:info" />
					</template>
					<div class="flex flex-col gap-4">
						<div>
							<div class="text-sm text-muted mb-1">
								Salt Ratio
							</div>
							<div>
								{{ ferment.saltRatio }}%
							</div>
						</div>
						<USeparator />
						<div>
							<div class="text-sm text-muted mb-1">
								Start Date
							</div>
							<div>
								{{ formatDate(ferment.startDate) }}
							</div>
						</div>
						<div v-if="ferment.endDate">
							<div class="text-sm text-muted mb-1">
								End Date
							</div>
							<div class="flex items-center gap-2">
								{{ formatDate(ferment.endDate) }}
								<UBadge v-if="ferment.state === 'active' && isFermentOverdue(ferment)" color="warning" variant="subtle" class="-my-1">
									Overdue
								</UBadge>
							</div>
						</div>
						<USeparator />
						<div>
							<div class="text-sm text-muted mb-1">
								Created
							</div>
							<div>
								{{ formatDateTime(ferment.createdAt) }}
							</div>
						</div>
						<div>
							<div class="text-sm text-muted mb-1">
								Last Updated
							</div>
							<div>
								{{ formatDateTime(ferment.updatedAt) }}
							</div>
						</div>
					</div>
				</UCard>

				<!-- Ingredients -->
				<UCard v-if="ferment.ingredients.length > 0">
					<template #header>
						<CardHeader title="Ingredients" icon="lucide:list" />
					</template>
					<div class="flex flex-col gap-2">
						<template
							v-for="(ingredient, index) in ferment.ingredients"
							:key="ingredient.id"
						>
							<div class="flex items-center justify-between">
								<span>{{ ingredient.name }}</span>
								<span class="text-sm text-muted">
									{{ ingredient.quantity }} {{ ingredient.unit }}
								</span>
							</div>
							<USeparator v-if="index < ferment.ingredients.length - 1" />
						</template>
					</div>
				</UCard>
			</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";

	const { ferment } = defineProps<{
		ferment: Ferment
	}>();
</script>
