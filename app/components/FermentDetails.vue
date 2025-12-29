<template>
	<div class="flex flex-col gap-4">
		<!-- Header -->
		<div v-if="withHeader" class="flex items-start justify-between gap-4">
			<div>
				<span class="text-2xl font-bold">
					{{ ferment.name }}
				</span>
				<div class="flex items-center gap-2 mt-1 text-sm text-muted">
					<UBadge v-if="ferment.state === 'completed'" variant="subtle" color="neutral">
						Completed
					</UBadge>
					<span>
						{{ formatTimeSince(ferment.startDate) }}
					</span>
					<template v-if="ferment.state === 'active' && ferment.endDate && !isFermentOverdue(ferment)">
						·
						<span>{{ formatTimeSince(getISODate(), ferment.endDate) }} remaining</span>
					</template>
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
		<div class="grid gap-4 lg:grid-cols-3">
			<!-- Main content -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<!-- Image -->
				<UCarousel
					v-if="ferment.images.length"
					v-slot="{ item }"
					:items="ferment.images"
					:class="{ 'mb-8': ferment.images.length > 3 }"
					:dots="ferment.images.length > 3"
					:prev="{ variant: 'solid' }" :next="{ variant: 'solid' }"
					:ui="{ item: 'basis-[calc((100%-1rem)/3)] ps-0 ml-2 first:ml-0 rounded-lg my-auto relative', container: 'ms-0' }"
				>
					<img :src="item.base64" :alt="`Ferment Image taken on ${item.date}`" class="rounded-lg" :width="480" :height="480">
					<div class="absolute left-0 right-0 bottom-0 p-1 flex justify-center">
						<UBadge color="neutral" variant="subtle">
							{{ ferment.startDate <= item.date ? `Day ${getDaysBetween(ferment.startDate, item.date) + 1}` : formatDate(item.date) }}
						</UBadge>
					</div>
				</UCarousel>
				<div v-else class="max-lg:hidden w-full flex-1 overflow-hidden rounded-lg">
					<div class="bg-elevated h-full flex-center">
						<UIcon name="lucide:salad" class="size-16 text-muted" />
					</div>
				</div>

				<!-- Notes -->
				<UCard>
					<template #header>
						<CardHeader title="Notes" icon="lucide:notebook-pen" />
					</template>
					<div v-if="ferment.notes" class="whitespace-pre-wrap">
						{{ ferment.notes }}
					</div>
					<div v-else class="text-muted">
						No notes
					</div>
				</UCard>
			</div>

			<!-- Sidebar -->
			<div class="max-lg:row-start-1 flex flex-col gap-4">
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
				<UCard>
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

			<template v-if="ferment.state === 'completed'">
				<RatingsCard
					v-for="rating of RATING_CATEGORIES"
					:key="rating.key"
					:title="rating.name"
					:icon="rating.icon"
					:rating="ferment[rating.key]"
				/>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";
	import { RATING_CATEGORIES } from "~/types/ferment";

	const { ferment, withHeader = true } = defineProps<{
		ferment: Ferment
		withHeader?: boolean
	}>();
</script>
