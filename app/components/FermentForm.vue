<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<!-- Name -->
		<UFormField label="Name" name="name" required>
			<UInput v-model="formData.name" placeholder="e.g., Garlic Honey, Kimchi, Sauerkraut" size="lg" />
		</UFormField>

		<!-- Image -->
		<UFormField label="Image (optional)" name="image">
			<div class="space-y-3">
				<div v-if="formData.imageBase64" class="relative">
					<img
						:src="formData.imageBase64"
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
					{{ formData.imageBase64 ? 'Change Image' : 'Add Image' }}
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
				{{ props.initialData ? 'Update' : 'Create' }} Ferment
			</UButton>
		</div>
	</form>
</template>

<script lang="ts" setup>
	import type { Ferment, Ingredient } from "~/types/ferment";
	import { generateId } from "~/types/ferment";

	const props = defineProps<{
		initialData?: Ferment | null
	}>();

	const emit = defineEmits<{
		submit: [data: Omit<Ferment, "id" | "createdAt" | "updatedAt">]
		cancel: []
	}>();

	const fileInput = ref<HTMLInputElement | null>(null);

	const formData = ref({
		name: props.initialData?.name || "",
		ingredients: props.initialData?.ingredients?.map((i) => ({ ...i })) || [] as Ingredient[],
		saltRatio: props.initialData?.saltRatio ?? 2,
		notes: props.initialData?.notes || "",
		imageBase64: props.initialData?.imageBase64 || "",
		startDate: props.initialData?.startDate || new Date().toISOString().split("T")[0],
		endDate: props.initialData?.endDate || "",
		isArchived: props.initialData?.isArchived || false,
		rating: props.initialData?.rating,
		completionNotes: props.initialData?.completionNotes
	});

	watch(() => props.initialData, (newData) => {
		if (newData) {
			formData.value = {
				name: newData.name || "",
				ingredients: newData.ingredients?.map((i) => ({ ...i })) || [],
				saltRatio: newData.saltRatio ?? 2,
				notes: newData.notes || "",
				imageBase64: newData.imageBase64 || "",
				startDate: newData.startDate || new Date().toISOString().split("T")[0],
				endDate: newData.endDate || "",
				isArchived: newData.isArchived || false,
				rating: newData.rating,
				completionNotes: newData.completionNotes
			};
		} else {
			formData.value = {
				name: "",
				ingredients: [],
				saltRatio: 2,
				notes: "",
				imageBase64: "",
				startDate: new Date().toISOString().split("T")[0],
				endDate: "",
				isArchived: false,
				rating: undefined,
				completionNotes: undefined
			};
		}
	}, { immediate: true });

	const isValid = computed(() => {
		return formData.value.name.trim() !== "" && formData.value.startDate !== "";
	});

	const addIngredient = () => {
		formData.value.ingredients.push({
			id: generateId(),
			name: "",
			amount: "",
			unit: ""
		});
	};

	const removeIngredient = (index: number) => {
		formData.value.ingredients.splice(index, 1);
	};

	const selectImage = () => {
		fileInput.value?.click();
	};

	const handleImageSelect = async (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			formData.value.imageBase64 = e.target?.result as string;
		};
		reader.readAsDataURL(file);
	};

	const removeImage = () => {
		formData.value.imageBase64 = "";
	};

	const handleSubmit = () => {
		if (!isValid.value) return;

		// Filter out empty ingredients
		const validIngredients = formData.value.ingredients.filter((i) => i.name.trim() !== "");

		emit("submit", {
			name: formData.value.name.trim(),
			ingredients: validIngredients,
			saltRatio: formData.value.saltRatio,
			notes: formData.value.notes,
			imageBase64: formData.value.imageBase64,
			startDate: formData.value.startDate,
			endDate: formData.value.endDate || undefined,
			isArchived: formData.value.isArchived,
			rating: formData.value.rating,
			completionNotes: formData.value.completionNotes
		});
	};
</script>
