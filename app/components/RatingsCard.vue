<template>
	<UCard>
		<template #header>
			<CardHeader :title="title" :icon="icon">
				<StarsCell :stars="rating.stars" />
			</CardHeader>
		</template>
		<div v-if="rating.notes" class="whitespace-pre-wrap text-sm">
			{{ rating.notes }}
		</div>
		<div v-else class="flex-center text-sm text-muted">
			No notes
		</div>
	</UCard>
</template>

<script setup lang="ts">
	import type { Rating } from "~/types/ferment";
	import StarsCell from "~/components/Table/StarsCell.vue";

	defineProps<{
		title: string
		icon: string
		rating: Rating
	}>();
</script>
