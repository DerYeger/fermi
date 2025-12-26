<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<!-- Name -->
		<UFormField label="Name" name="name" required>
			<UInput v-model="formData.name" placeholder="e.g., Garlic Honey, Kimchi, Sauerkraut" size="lg" autofocus />
		</UFormField>

		<!-- Image -->
		<UFormField label="Images (optional)" name="images">
			<div class="flex flex-wrap gap-2">
				<div v-for="(image, index) of formData.images" :key="index" class="p-1 flex flex-col gap-1 items-center justify-between w-fit">
					<img :src="image.base64" :alt="`Ferment image taken on ${image.date}`" :height="96" :width="96">
					<UButton
						icon="lucide:trash-2"
						label="Remove"
						color="error"
						size="sm"
						@click="formData.images.splice(index, 1)"
					/>
				</div>
			</div>
			<UFileUpload v-model="imageInput" accept="image/*" />
			<div class="flex items-center gap-2 mt-2">
				<div>
					<UInput v-model="imageDate" type="date" size="sm" />
				</div>
				<UTooltip :disabled="imageInput && isImageDateValid" :text="!imageInput ? 'Select an image' : 'Provide a valid date'">
					<UButton :disabled="!imageInput || !isImageDateValid" variant="outline" icon="lucide:plus" size="sm" @click="addImage">
						Add image
					</UButton>
				</UTooltip>
			</div>
		</UFormField>

		<!-- Salt Ratio -->
		<UFormField label="Salt ratio (%)" name="saltRatio" required>
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
						v-model.number="ingredient.amount"
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
					Add ingredient
				</UButton>
			</div>
		</UFormField>

		<!-- Dates -->
		<div class="grid grid-cols-2 gap-4">
			<UFormField label="Start date" name="startDate" required>
				<UInput v-model="formData.startDate" type="date" size="lg" />
			</UFormField>
			<UFormField :label="isEditingCompleted ? 'End date (optional)' : 'End date'" name="endDate">
				<div class="flex gap-2">
					<UInput v-model="formData.endDate" type="date" size="lg" class="flex-1" />
					<UButton
						v-if="!isEditingCompleted && formData.endDate"
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
		<div class="flex justify-end gap-3 pt-4 border-t border-default">
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
	import type { FermentBase } from "~/types/ferment";
	import Compressor from "compressorjs";
	import { nanoid } from "nanoid";

	const { initialData, isEditingCompleted = false } = defineProps<{
		initialData?: FermentBase | null
		isEditingCompleted?: boolean
	}>();

	const emit = defineEmits<{
		submit: [data: Omit<FermentBase, "id" | "createdAt">]
		cancel: []
	}>();

	interface IngredientInput {
		id: string
		name: string
		amount: number | undefined
		unit: string
	}

	const formData = ref({
		name: initialData?.name ?? "",
		images: initialData?.images ?? [],
		ingredients: initialData?.ingredients?.map((i) => ({ ...i })) ?? [] as IngredientInput[],
		saltRatio: initialData?.saltRatio ?? 2,
		notes: initialData?.notes ?? "",
		startDate: initialData?.startDate ?? getCurrentISODate(),
		endDate: initialData?.endDate ?? ""
	});

	watch(() => initialData, (newData) => {
		if (newData) {
			formData.value = {
				name: newData.name ?? "",
				images: newData.images ?? [],
				ingredients: newData.ingredients?.map((i) => ({ ...i })) ?? [],
				saltRatio: newData.saltRatio ?? 2,
				notes: newData.notes ?? "",
				startDate: newData.startDate ?? getCurrentISODate(),
				endDate: newData.endDate ?? ""
			};
		} else {
			formData.value = {
				name: "",
				images: [],
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

	const imageInput = ref<File>();
	const imageDate = ref<string>(getCurrentISODate());
	const isImageDateValid = computed(() => {
		return z.iso.date().safeParse(imageDate.value).success;
	});

	async function addImage() {
		const image = imageInput.value;
		if (!image) return;
		const base64 = await new Promise<string>((resolve, reject) =>
			new Compressor(image, {
				quality: 0.8,
				maxWidth: 720,
				maxHeight: 720,
				success(compressedImage) {
					const reader = new FileReader();
					reader.onload = (e) => {
						resolve(e.target?.result as string);
					};
					reader.readAsDataURL(compressedImage);
				},
				error(err) {
					reject(err);
				}
			}));
		formData.value.images.push({
			base64,
			date: imageDate.value
		});
		imageInput.value = undefined;
		imageDate.value = getCurrentISODate();
	}

	const wasIngredientAdded = ref(false);

	function addIngredient() {
		wasIngredientAdded.value = true;
		formData.value.ingredients.push({
			id: nanoid(),
			name: "",
			amount: undefined,
			unit: ""
		});
	}

	function removeIngredient(index: number) {
		formData.value.ingredients.splice(index, 1);
	}

	function handleSubmit() {
		if (!isValid.value) return;

		emit("submit", {
			name: formData.value.name.trim(),
			images: formData.value.images,
			ingredients: formData.value.ingredients.map((i) => ({
				id: i.id,
				name: i.name.trim(),
				amount: i.amount ?? 0,
				unit: i.unit.trim()
			})),
			saltRatio: formData.value.saltRatio,
			notes: formData.value.notes,
			startDate: formData.value.startDate,
			endDate: formData.value.endDate || undefined,
			updatedAt: new Date().toISOString()
		});
	};
</script>
