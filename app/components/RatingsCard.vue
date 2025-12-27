<template>
	<UCard>
		<template #header>
			<CardHeader title="Notes" icon="lucide:notebook-pen" />
		</template>
		<StarsCell :stars="rating.stars" class="mb-4" />
		<p class="whitespace-pre-wrap">
			{{ rating.notes }}
		</p>
	</UCard>
</template>

<script setup lang="ts">
	import type { Rating } from "~/types/ferment";
	import StarsCell from "~/components/Table/StarsCell.vue";

	defineProps<{
		rating: Rating
	}>();
</script>
