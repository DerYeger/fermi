<template>
	<UFormField
		name="images"
		label="Images"
	>
		<UFileUpload
			ref="fileUpload"
			class="hidden"
			accept="image/*"
			:disabled="isLoadingImages"
			multiple
			@update:model-value="onUpload"
		/>
		<div :class="{ 'mb-2': model.length > 0 }">
			<UButton variant="subtle" icon="lucide:plus" :loading="isLoadingImages" label="Add image" @click="fileUpload?.inputRef.click()" />
		</div>
		<UScrollArea v-if="model.length > 0" v-slot="{ item, index }" orientation="horizontal" :items="model" :ui="{ item: 'ml-2 first:ml-0' }">
			<div
				class="flex flex-col gap-2 pb-2"
			>
				<div>
					<img :src="item.base64" alt="Ferment image" class="w-51 aspect-square object-cover rounded-md">
				</div>
				<div class="flex gap-2">
					<div>
						<UFormField
							:name="`images.${index}.date`"
							required
						>
							<InputDatePicker v-model="item.date" />
						</UFormField>
					</div>
					<div>
						<UButton
							color="error"
							icon="lucide:trash-2"
							variant="subtle"
							@click="removeImage(index)"
						/>
					</div>
				</div>
			</div>
		</UScrollArea>
	</UFormField>
</template>

  <script setup lang="ts">
	import type { FermentImage } from "~/types/ferment";
	import Compressor from "compressorjs";
	import { nanoid } from "nanoid";
import { getErrorMessage } from "~/types/utils";

	const model = defineModel<FermentImage[]>({
		required: true
	});

	const fileUpload = useTemplateRef("fileUpload");

	const isLoadingImages = ref(false);

	const toast = useToast();

	async function onUpload(files: File[] | null | undefined) {
		if (!files) return;
		isLoadingImages.value = true;
		try {
			const processImages = await Promise.all(files.map(processFile));
			const initialDate = getISODate();
			const newImages: FermentImage[] = processImages.map((base64) => ({
				id: nanoid(),
				base64,
				date: initialDate
			}));
			model.value.push(...newImages);
		} catch (error) {
			toast.add({ title: "Error uploading images", description: getErrorMessage(error), color: "error" });
		} finally {
			isLoadingImages.value = false;
		}
	}

	async function processFile(file: File): Promise<string> {
		return await new Promise<string>((resolve, reject) =>
			new Compressor(file, {
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
	}

	function removeImage(index: number) {
		model.value.splice(index, 1);
	}
  </script>
