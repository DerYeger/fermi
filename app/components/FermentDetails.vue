<template>
	<div class="flex text-default text-base flex-col gap-4">
		<!-- Header -->
		<div v-if="withHeader" class="flex items-center justify-between gap-4 flex-wrap">
			<div class="text-2xl font-bold max-w-full truncate">
				{{ ferment.name }}
			</div>

			<div class="flex items-center gap-2">
				<FavoriteFermentButton :ferment="ferment" />
				<EditFermentButton :ferment="ferment" />
				<DuplicateFermentButton :ferment="ferment" />
				<template v-if="ferment.state === 'active'">
					<ArchiveFermentButton :ferment="ferment" />
					<FailFermentButton :ferment="ferment" />
				</template>
				<UnarchiveFermentButton v-else-if="ferment.state === 'completed'" :ferment="ferment" />
				<UnfailFermentButton v-else-if="ferment.state === 'failed'" :ferment="ferment" />
				<DeleteFermentButton :ferment="ferment" />
			</div>
		</div>

		<!-- Content -->
		<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
			<!-- Details -->
			<div class="lg:col-span-2 flex flex-col gap-4">
				<UCard class="min-h-full">
					<template #header>
						<CardHeader title="Details" icon="hugeicons:information-square">
							<UBadge v-if="ferment.state === 'completed'" color="success" variant="subtle">
								Completed
							</UBadge>
							<UBadge v-if="ferment.state === 'failed'" color="error" variant="subtle">
								Failed
							</UBadge>
						</CardHeader>
					</template>
					<div class="flex flex-col gap-4">
						<div v-if="ferment.container">
							<div class="text-sm text-muted mb-1">
								Container
							</div>
							<div>
								{{ ferment.container }}
							</div>
						</div>
						<div>
							<div class="text-sm text-muted mb-1">
								Salt Ratio
							</div>
							<div>
								{{ formatPercentage(ferment.saltRatio) }}
							</div>
						</div>
						<USeparator />
						<div>
							<div class="text-sm text-muted mb-1">
								Duration
							</div>
							<div>
								{{ formatTimeSince(ferment.startDate, ferment.endDate ?? getISODate()) }}
							</div>
						</div>
						<div v-if="ferment.state === 'active' && ferment.endDate && !isFermentOverdue(ferment)">
							<div class="text-sm text-muted mb-1">
								Remaining
							</div>
							<div>
								{{ formatTimeSince(getISODate(), ferment.endDate) }}
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
			</div>

			<!-- Images -->
			<div class="md:col-span-2 lg:col-span-4 flex flex-col" :class="{ 'max-md:hidden': !ferment.images.length }">
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
				<div v-else class="w-full flex-1 overflow-hidden rounded-lg">
					<div class="bg-elevated h-full flex-center">
						<UIcon name="hugeicons:iconjar" class="size-16 text-muted" />
					</div>
				</div>
			</div>

			<!-- Ingredients -->
			<div class="lg:col-span-2 lg:row-span-2">
				<UCard class="min-h-full flex flex-col" :ui="{ body: 'flex-1 flex flex-col' }">
					<template #header>
						<CardHeader title="Ingredients" icon="hugeicons:left-to-right-list-dash" />
					</template>
					<div v-if="ferment.ingredients.length > 0" class="flex flex-col gap-2">
						<template
							v-for="(ingredient, index) in ferment.ingredients"
							:key="ingredient.id"
						>
							<div class="flex items-center justify-between gap-1">
								<span class="flex-1 truncate">{{ ingredient.name }}</span>
								<span class="text-sm text-muted">
									{{ formatQuantity(ingredient.quantity, ingredient.unit) }}
								</span>
							</div>
							<USeparator v-if="index < ferment.ingredients.length - 1" />
						</template>
					</div>
					<div v-else class="flex-1 flex-center text-sm text-muted">
						No ingredients
					</div>
				</UCard>
			</div>

			<!-- Notes -->
			<div class="lg:row-span-2 lg:col-span-2">
				<UCard class="min-h-full flex flex-col" :ui="{ body: 'flex-1 flex flex-col' }">
					<template #header>
						<CardHeader title="Notes" icon="hugeicons:note-01" />
					</template>
					<div v-if="ferment.notes" class="whitespace-pre-wrap">
						{{ ferment.notes }}
					</div>
					<div v-else class="flex-1 flex-center text-sm text-muted">
						No notes
					</div>
				</UCard>
			</div>

			<!-- Ratings -->
			<template v-if="ferment.state === 'completed'">
				<div
					v-for="rating of RATING_CATEGORIES"
					:key="rating.key"
					class="lg:col-span-2"
				>
					<RatingsCard
						:title="rating.name"
						:icon="rating.icon"
						:rating="ferment[rating.key]"
					/>
				</div>
			</template>

			<template v-if="ferment.state === 'failed'">
				<div
					class="lg:row-span-2 lg:col-span-2"
				>
					<UCard class="min-h-full flex flex-col" :ui="{ body: 'flex-1 flex flex-col' }">
						<template #header>
							<CardHeader title="Reason" icon="hugeicons:waste" />
						</template>
						<div v-if="ferment.reason" class="whitespace-pre-wrap text-sm">
							{{ ferment.reason }}
						</div>
						<div v-else class="flex-1 flex-center text-sm text-muted">
							No reason
						</div>
					</UCard>
				</div>
			</template>
		</div>
	</div>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";
	import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";
	import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";
	import FailFermentButton from "~/components/Forms/FailFermentForm/FailFermentButton.vue";
	import { RATING_CATEGORIES } from "~/types/ferment";
	import { formatPercentage } from "~/types/utils";

	const { ferment, withHeader = true } = defineProps<{
		ferment: Ferment
		withHeader?: boolean
	}>();
</script>
