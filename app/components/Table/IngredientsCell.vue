<template>
	<div class="flex gap-1 flex-wrap">
		<UBadge
			v-for="ingredient in ingredients"
			:key="ingredient.id"
			variant="subtle"
			class="max-w-24"
		>
			<span class="text-ellipsis overflow-hidden">
				{{ ingredient.name }}
			</span>
		</UBadge>
	</div>
</template>

<script lang="ts" setup>
	import type { Ingredient } from "~/types/ferment";

	const { ingredients } = defineProps<{
		ingredients: Ingredient[]
	}>();
</script>
