<template>
	<div
		class="grid grid-cols-[4fr_2fr_2fr_max-content] gap-2"
	>
		<UFormField
			:name="`ingredients.${index}.name`"
			required
		>
			<UInputMenu
				v-model="ingredient.name"
				v-model:open="nameInputOpen"
				:autofocus="wasIngredientAdded"
				create-item
				placeholder="Name"
				:items="ingredientNames"
				@create="onCreateName"
				@blur="nameInputOpen = false"
			/>
		</UFormField>

		<UFormField
			:name="`ingredients.${index}.quantity`"
			required
		>
			<UInputNumber v-model="ingredient.quantity" :min="0" placeholder="Quantity" />
		</UFormField>

		<UFormField
			:name="`ingredients.${index}.unit`"
			required
		>
			<UInputMenu
				v-model="ingredient.unit"
				v-model:open="unitInputOpen"
				value-key="value"
				create-item
				placeholder="Unit"
				:items="unitItems"
				@create="onCreateUnit"
				@blur="unitInputOpen = false"
			/>
		</UFormField>

		<div>
			<UButton
				color="error"
				icon="lucide:trash-2"
				variant="subtle"
				@click="emit('remove')"
			/>
		</div>
	</div>
</template>

<script setup lang="ts">
	import type { InputMenuItem } from "@nuxt/ui";
	import type { Ingredient } from "~/types/ferment";

	defineProps<{
		index: number
		ingredientNames: string[]
		unitItems: InputMenuItem[]
		wasIngredientAdded: boolean
	}>();

	const emit = defineEmits<{
		(e: "remove"): void
	}>();

	const ingredient = defineModel<Ingredient>({
		required: true
	});

	const nameInputOpen = ref(false);
	const unitInputOpen = ref(false);

	function onCreateName(name: string) {
		ingredient.value.name = name.trim();
	}

	function onCreateUnit(unit: string) {
		ingredient.value.unit = unit.trim();
	}
</script>
