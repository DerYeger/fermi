<template>
	<UFormField
		name="ingredients"
		label="Ingredients"
		required
	>
		<div class="flex flex-col gap-2">
			<IngredientFormField
				v-for="(ingredient, index) in model"
				:key="ingredient.id"
				:model-value="ingredient"
				:index="index"
				:ingredient-names="ingredientNames"
				:unit-items="unitItems"
				:was-ingredient-added="wasIngredientAdded"
				@update:model-value="model[index] = $event"
				@remove="removeIngredient(index)"
			/>
			<div>
				<UButton variant="subtle" icon="hugeicons:plus-sign" label="Add ingredient" @click="addIngredient" />
			</div>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
	import type { InputMenuItem } from "@nuxt/ui";
	import type { Ingredient } from "~/types/ferment";
	import IngredientFormField from "~/components/Forms/FormFields/IngredientFormField.vue";
	import { PREDEFINED_UNITS } from "~/composables/useFerments";

	const model = defineModel<Ingredient[]>({
		required: true
	});

	const wasIngredientAdded = ref(false);

	const draftedIngredientNames = computed(() => {
		return model.value.map((ingredient) => ingredient.name).filter((name) => name.trim() !== "");
	});
	const ingredientNames = useIngredientNames(draftedIngredientNames);

	const draftedIngredientUnits = computed(() => {
		return model.value.map((ingredient) => ingredient.unit).filter((unit) => unit.trim() !== "");
	});
	const customIngredientUnits = useIngredientUnits(draftedIngredientUnits);

	const unitItems = computed<InputMenuItem[]>(() => {
		const items: InputMenuItem[] = [];
		const predefinedUnits = Object.entries(PREDEFINED_UNITS);
		predefinedUnits.forEach(([category, units], index) => {
			items.push({ type: "label", label: category });
			for (const unit of units) {
				items.push({ type: "item", label: unit, value: unit });
			}
			if (index < predefinedUnits.length - 1) {
				items.push({ type: "separator" });
			}
		});
		if (customIngredientUnits.value.length > 0) {
			items.push({ type: "separator" });
			items.push({ type: "label", label: "Custom" });
			for (const unit of customIngredientUnits.value) {
				items.push({ type: "item", label: unit, value: unit });
			}
		}
		return items;
	});

	function addIngredient() {
		wasIngredientAdded.value = true;
		model.value.push({
			id: createId(),
			name: "",
			quantity: 0,
			unit: ""
		});
	}

	function removeIngredient(index: number) {
		model.value.splice(index, 1);
	}
</script>
