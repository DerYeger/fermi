<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<!-- Name -->
		<UFormField label="Name" name="name" required>
			<UInput v-model="formData.name" placeholder="e.g., Garlic Honey, Kimchi, Sauerkraut" size="lg" autofocus />
		</UFormField>

		<!-- Image -->
		<UFormField label="Image (optional)" name="image">
			<div class="space-y-3">
				<div v-if="false" class="relative">
					<img
						:src="undefined"
						alt="Ferment preview"
						class="w-full max-h-48 object-cover rounded-lg"
					>
					<UButton
						icon="lucide:x"
						size="xs"
						color="error"
						variant="solid"
						class="absolute top-2 right-2"
						@click="removeImage"
					/>
				</div>
				<UButton variant="outline" icon="lucide:image-plus" @click="selectImage">
					{{ false ? 'Change Image' : 'Add Image' }}
				</UButton>
				<input
					ref="fileInput"
					type="file"
					accept="image/*"
					class="hidden"
					@change="handleImageSelect"
				>
			</div>
		</UFormField>

		<!-- Salt Ratio -->
		<UFormField label="Salt Ratio (%)" name="saltRatio" required>
			<UInput v-model.number="formData.saltRatio" type="number" min="0" max="100" step="0.1" size="lg" />
		</UFormField>

		<!-- Ingredients -->
		<UFormField label="Ingredients" name="ingredients">
			<div class="space-y-3">
				<div v-for="(ingredient, index) in formData.ingredients" :key="ingredient.id" class="flex gap-2">
					<UInput
						v-model="ingredient.name"
						placeholder="Ingredient name"
						class="flex-1"
						:autofocus="wasIngredientAdded"
					/>
					<UInput
						v-model="ingredient.amount"
						placeholder="Amount"
						class="w-24"
					/>
					<UInput
						v-model="ingredient.unit"
						placeholder="Unit"
						class="w-20"
					/>
					<UButton
						icon="lucide:trash-2"
						variant="ghost"
						color="error"
						@click="removeIngredient(index)"
					/>
				</div>
				<UButton
					variant="outline"
					icon="lucide:plus"
					size="sm"
					@click="addIngredient"
				>
					Add Ingredient
				</UButton>
			</div>
		</UFormField>

		<!-- Dates -->
		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Start Date" name="startDate" required>
				<UInput v-model="formData.startDate" type="date" size="lg" />
			</UFormField>
			<UFormField label="End Date (optional)" name="endDate">
				<div class="flex gap-2">
					<UInput v-model="formData.endDate" type="date" size="lg" class="flex-1" />
					<UButton
						v-if="formData.endDate"
						icon="lucide:x"
						variant="ghost"
						color="neutral"
						@click="formData.endDate = ''"
					/>
				</div>
			</UFormField>
		</div>

		<!-- Notes -->
		<UFormField label="Notes (optional)" name="notes">
			<UTextarea
				v-model="formData.notes"
				placeholder="Any observations, recipe notes, or reminders..."
				:rows="4"
			/>
		</UFormField>

		<!-- Actions -->
		<div class="flex justify-end gap-3 pt-4 border-t border-(--ui-border)">
			<UButton variant="ghost" @click="$emit('cancel')">
				Cancel
			</UButton>
			<UButton type="submit" :disabled="!isValid">
				{{ initialData ? 'Update' : 'Create' }} Ferment
			</UButton>
		</div>
	</form>
</template>

<script lang="ts" setup>
	import type { FermentBase, Ingredient } from "~/types/ferment";
	import { nanoid } from "nanoid";

	const { initialData } = defineProps<{
		initialData?: FermentBase | null
	}>();

	const emit = defineEmits<{
		submit: [data: Omit<FermentBase, "id" | "createdAt">]
		cancel: []
	}>();

  const fileInput = ref<HTMLInputElement | null>(null);

  type IngredientInput = {
    id: string;
    name: string;
    amount: string;
    unit: string;
  }

	const formData = ref({
		name: initialData?.name ?? "",
		ingredients: initialData?.ingredients?.map((i) => ({ ...i, amount: `${i.amount}` })) ?? [] as IngredientInput[],
		saltRatio: initialData?.saltRatio ?? 2,
		notes: initialData?.notes ?? "",
		startDate: initialData?.startDate ?? getCurrentISODate(),
		endDate: initialData?.endDate ?? ""
	});

	watch(() => initialData, (newData) => {
		if (newData) {
			formData.value = {
				name: newData.name ?? "",
				ingredients: newData.ingredients?.map((i) => ({ ...i, amount: `${i.amount}` })) ?? [],
				saltRatio: newData.saltRatio ?? 2,
				notes: newData.notes ?? "",
				startDate: newData.startDate ?? getCurrentISODate(),
				endDate: newData.endDate ?? ""
			};
		} else {
			formData.value = {
				name: "",
				ingredients: [],
				saltRatio: 2,
				notes: "",
				startDate: getCurrentISODate(),
				endDate: ""
			};
		}
	}, { immediate: true });

	const isValid = computed(() => {
		return formData.value.name.trim() !== "" && formData.value.startDate !== "";
	});

	const wasIngredientAdded = ref(false);

	function addIngredient() {
		wasIngredientAdded.value = true;
    formData.value.ingredients.push({
      id: nanoid(),
			name: "",
			amount: "",
			unit: ""
		});
	}

	function removeIngredient(index: number) {
		formData.value.ingredients.splice(index, 1);
	}

	function selectImage() {
		fileInput.value?.click();
	}

	function handleImageSelect(_event: Event) {
		// const input = event.target as HTMLInputElement;
		// const file = input.files?.[0];
		// if (!file) return;

		// const reader = new FileReader();
		// reader.onload = (e) => {
		// 	formData.value.imageBase64 = e.target?.result as string;
		// };
		// reader.readAsDataURL(file);
	};

	function removeImage() {
		// formData.value.imageBase64 = "";
	}

	function handleSubmit() {
		if (!isValid.value) return;

		emit("submit", {
			name: formData.value.name.trim(),
			ingredients: formData.value.ingredients.map((i) => ({
        id: i.id,
        name: i.name.trim(),
        amount: parseFloat(i.amount),
        unit: i.unit.trim()
      })),
			saltRatio: formData.value.saltRatio,
			notes: formData.value.notes,
			imagePaths: [],
			startDate: formData.value.startDate,
      endDate: formData.value.endDate || undefined,
      updatedAt: new Date().toISOString()
		});
};
</script>
