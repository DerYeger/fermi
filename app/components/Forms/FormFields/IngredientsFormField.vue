<template>
	<UFormField
		name="ingredients"
		label="Ingredients"
		required
	>
		<div class="flex flex-col gap-2 pt-2">
			<div
				v-for="(ingredient, index) in model"
				:key="index"
				class="flex gap-2"
			>
				<UFormField
					:name="`ingredients.${index}.name`"
					label="Name"
					required
				>
					<UInput v-model="ingredient.name" />
				</UFormField>

				<UFormField
					:name="`ingredients.${index}.amount`"
					label="Amount"
					required
				>
					<UInputNumber v-model="ingredient.amount" :min="0" />
				</UFormField>

				<UFormField
					:name="`ingredients.${index}.unit`"
					label="Unit"
					required
				>
					<UInput v-model="ingredient.unit" />
				</UFormField>

				<div class="mt-6">
					<UButton
						color="error"
						icon="lucide:trash-2"
						variant="soft"
						@click="removeIngredient(index)"
					>
						Remove
					</UButton>
				</div>
			</div>
			<div>
				<UButton variant="outline" icon="lucide:plus" label="Add ingredient" @click="addIngredient" />
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
</script>
