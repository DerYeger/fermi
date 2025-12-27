<template>
	<UFormField
		name="ingredients"
		label="Ingredients"
		required
	>
		<div class="flex flex-col gap-2">
			<div
				v-for="(ingredient, index) in model"
				:key="index"
				class="flex gap-2"
			>
				<UFormField
					:name="`ingredients.${index}.name`"
					required
				>
					<UInputMenu v-model="ingredient.name" :autofocus="wasIngredientAdded" create-item placeholder="Name" :items="ingredientNames" @create="onCreateName(index, $event)" />
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
					<UInputMenu v-model="ingredient.unit" value-key="value" create-item placeholder="Unit" :items="unitItems" @create="onCreateUnit(index, $event)" />
				</UFormField>

				<div>
					<UButton
						color="error"
						icon="lucide:trash-2"
						variant="subtle"
						@click="removeIngredient(index)"
					/>
				</div>
			</div>
			<div>
				<UButton variant="subtle" icon="lucide:plus" label="Add ingredient" @click="addIngredient" />
			</div>
		</div>
	</UFormField>
</template>

<script setup lang="ts">
	import type { InputMenuItem } from "@nuxt/ui";
	import type { Ingredient } from "~/types/ferment";
	import { nanoid } from "nanoid";
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
		const items: InputMenuItem[] = [
		];
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
			id: nanoid(),
			name: "",
			quantity: 0,
			unit: ""
		});
	}

	function removeIngredient(index: number) {
		model.value.splice(index, 1);
	}

	function onCreateName(index: number, name: string) {
		const item = model.value[index];
		if (!item) return;
		item.name = name.trim();
	}

	function onCreateUnit(index: number, unit: string) {
		console.log(unit);

		const item = model.value[index];
		if (!item) return;
		item.unit = unit.trim();
	}
</script>
