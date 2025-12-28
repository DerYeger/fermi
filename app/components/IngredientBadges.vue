<template>
	<div class="flex flex-wrap gap-1">
		<UBadge
			v-for="ingredient in ingredients.slice(0, LIMIT)"
			:key="ingredient.id"
			variant="subtle"
			class="max-w-24"
		>
			<span class="truncate">
				{{ ingredient.name }}
			</span>
		</UBadge>
		<UBadge
			v-if="ingredients.length > LIMIT"
			variant="subtle"
			color="neutral"
		>
			+{{ ingredients.length - LIMIT }} more
		</UBadge>
	</div>
</template>

<script lang="ts" setup>
	import type { Ingredient } from "~/types/ferment";

	const { ingredients } = defineProps<{
		ingredients: Ingredient[]
	}>();

	const LIMIT = 3;
</script>
