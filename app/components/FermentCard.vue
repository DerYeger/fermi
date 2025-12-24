<template>
	<UCard class="group relative overflow-hidden cursor-pointer" :ui="{ body: 'p-0' }" @click="navigateToDetails">
		<!-- Image -->
		<div v-if="ferment.imageBase64" class="aspect-video w-full overflow-hidden">
			<img
				:src="ferment.imageBase64"
				:alt="ferment.name"
				class="size-full object-cover transition-transform group-hover:scale-105"
			>
		</div>
		<div v-else class="aspect-video w-full bg-(--ui-bg-elevated) flex-center">
			<UIcon name="lucide:flask-conical" class="size-12 text-(--ui-text-muted)" />
		</div>

		<!-- Content -->
		<div class="p-4">
			<div class="flex items-start justify-between gap-2 mb-2">
				<h3 class="font-semibold text-lg truncate">
					{{ ferment.name }}
				</h3>
				<UBadge v-if="ferment.isArchived" variant="subtle" color="neutral">
					Archived
				</UBadge>
			</div>

			<!-- Rating for archived -->
			<div v-if="ferment.isArchived && ferment.rating" class="flex items-center gap-1 mb-2">
				<UIcon
					v-for="i in 5"
					:key="i"
					:name="i <= ferment.rating ? 'lucide:star' : 'lucide:star'"
					:class="i <= ferment.rating ? 'text-yellow-500' : 'text-(--ui-text-muted)'"
					class="size-4"
				/>
			</div>

			<!-- Salt ratio -->
			<div class="flex items-center gap-2 text-sm text-(--ui-text-muted) mb-2">
				<UIcon name="lucide:percent" class="size-4" />
				<span>{{ ferment.saltRatio }}% salt</span>
			</div>

			<!-- Dates -->
			<div class="flex items-center gap-2 text-sm text-(--ui-text-muted) mb-2">
				<UIcon name="lucide:calendar" class="size-4" />
				<span>Started {{ formatDate(ferment.startDate) }}</span>
			</div>
			<div v-if="ferment.endDate" class="flex items-center gap-2 text-sm text-(--ui-text-muted) mb-2">
				<UIcon name="lucide:calendar-check" class="size-4" />
				<span>Ended {{ formatDate(ferment.endDate) }}</span>
			</div>

			<!-- Days fermenting -->
			<div v-if="!ferment.isArchived" class="flex items-center gap-2 text-sm text-(--ui-text-muted) mb-3">
				<UIcon name="lucide:clock" class="size-4" />
				<span>{{ daysFermenting }} days</span>
			</div>

			<!-- Ingredients preview -->
			<div v-if="ferment.ingredients.length > 0" class="mb-3">
				<div class="flex flex-wrap gap-1">
					<UBadge
						v-for="ingredient in ferment.ingredients.slice(0, 3)"
						:key="ingredient.id"
						variant="soft"
						size="sm"
					>
						{{ ingredient.name }}
					</UBadge>
					<UBadge
						v-if="ferment.ingredients.length > 3"
						variant="soft"
						size="sm"
						color="neutral"
					>
						+{{ ferment.ingredients.length - 3 }} more
					</UBadge>
				</div>
			</div>

			<!-- Actions -->
			<div class="flex items-center gap-2 pt-2 border-t border-(--ui-border)">
				<UButton variant="ghost" size="sm" icon="lucide:pencil" @click.stop="$emit('edit', ferment)">
					Edit
				</UButton>
				<UButton
					v-if="!ferment.isArchived"
					variant="ghost"
					size="sm"
					icon="lucide:archive"
					@click.stop="$emit('archive', ferment)"
				>
					Complete
				</UButton>
				<UButton
					v-else
					variant="ghost"
					size="sm"
					icon="lucide:archive-restore"
					@click.stop="$emit('unarchive', ferment)"
				>
					Restore
				</UButton>
				<UButton
					variant="ghost"
					size="sm"
					icon="lucide:trash-2"
					color="error"
					class="ml-auto"
					@click.stop="$emit('delete', ferment)"
				/>
			</div>
		</div>
	</UCard>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";

	const props = defineProps<{
		ferment: Ferment
	}>();

	defineEmits<{
		edit: [ferment: Ferment]
		archive: [ferment: Ferment]
		unarchive: [ferment: Ferment]
		delete: [ferment: Ferment]
	}>();

	const router = useRouter();

	const daysFermenting = computed(() => {
		const start = new Date(props.ferment.startDate);
		const end = props.ferment.endDate ? new Date(props.ferment.endDate) : new Date();
		const diffTime = Math.abs(end.getTime() - start.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	});

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric"
		});
	};

	const navigateToDetails = () => {
		router.push(`/ferment/${props.ferment.id}`);
	};
</script>
