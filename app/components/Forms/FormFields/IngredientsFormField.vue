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
					<UInputMenu v-model="ingredient.name" create-item placeholder="Name" :items="ingredientNames" @create="onCreateName(index, $event)" />
				</UFormField>

				<UFormField
					:name="`ingredients.${index}.amount`"
					required
				>
					<UInputNumber v-model="ingredient.amount" :min="0" placeholder="Amount" />
				</UFormField>

				<UFormField
					:name="`ingredients.${index}.unit`"
					required
				>
					<UInputMenu v-model="ingredient.unit" create-item placeholder="Unit" :items="ingredientUnits" @create="onCreateUnit(index, $event)" />
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
	import type { Ingredient } from "~/types/ferment";
	import { nanoid } from "nanoid";

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
	const ingredientUnits = useIngredientNames(draftedIngredientUnits);

	function addIngredient() {
		wasIngredientAdded.value = true;
		model.value.push({
			id: nanoid(),
			name: "",
			amount: 0,
			unit: ""
		});
	}

	function removeIngredient(index: number) {
		model.value.splice(index, 1);
	}

	function onCreateName(index: number, name: string) {
		const item = model.value[index];
		if (!item) return;
		item.name = name;
	}

	function onCreateUnit(index: number, unit: string) {
		const item = model.value[index];
		if (!item) return;
		item.unit = unit;
	}
</script>
