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
				v-model:search-term="nameSearchTerm"
				:autofocus="wasIngredientAdded"
				create-item
				placeholder="Name..."
				:items="ingredientNames"
				@create="onCreateName"
				@blur="onBlurName"
			/>
		</UFormField>

		<UFormField
			:name="`ingredients.${index}.quantity`"
			required
		>
			<UInputNumber v-model="ingredient.quantity" :min="0" placeholder="Quantity..." />
		</UFormField>

		<UFormField
			:name="`ingredients.${index}.unit`"
			required
		>
			<UInputMenu
				v-model="ingredient.unit"
				v-model:open="unitInputOpen"
				v-model:search-term="unitSearchTerm"
				value-key="value"
				create-item
				placeholder="Unit..."
				:items="unitItems"
				@create="onCreateUnit"
				@blur="onBlurUnit"
			/>
		</UFormField>

		<div>
			<UButton
				color="error"
				icon="hugeicons:delete-02"
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
	const nameSearchTerm = ref("");

	const unitInputOpen = ref(false);
	const unitSearchTerm = ref("");

	function onCreateName(name: string) {
		ingredient.value.name = name.trim();
	}

	function onCreateUnit(unit: string) {
		ingredient.value.unit = unit.trim();
	}

	function onBlurName() {
		const trimmedSearchTerm = nameSearchTerm.value.trim();
		if (!ingredient.value.name && trimmedSearchTerm) {
			onCreateName(trimmedSearchTerm);
		}
		nameInputOpen.value = false;
	}

	function onBlurUnit() {
		const trimmedSearchTerm = unitSearchTerm.value.trim();
		if (!ingredient.value.unit && trimmedSearchTerm) {
			onCreateUnit(trimmedSearchTerm);
		}
		unitInputOpen.value = false;
	}
</script>
