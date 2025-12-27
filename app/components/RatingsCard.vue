<template>
	<UCard>
		<template #header>
			<CardHeader :title="title" :icon="icon" />
		</template>
		<div class="flex flex-col gap-2">
			<StarsCell :stars="rating.stars" />
			<p v-if="rating.notes" class="whitespace-pre-wrap">
				{{ rating.notes }}
			</p>
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
