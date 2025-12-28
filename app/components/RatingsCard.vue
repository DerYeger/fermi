<template>
	<UCard>
		<template #header>
			<CardHeader :title="title" :icon="icon">
				<StarsCell :stars="rating.stars" />
			</CardHeader>
		</template>
		<div v-if="rating.notes" class="whitespace-pre-wrap">
			{{ rating.notes }}
		</div>
		<div v-else class="text-muted">
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
