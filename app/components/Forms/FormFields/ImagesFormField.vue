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
			<UButton variant="subtle" icon="hugeicons:image-upload" :loading="isLoadingImages" label="Select images" @click="fileUpload?.inputRef.click()" />
		</div>
		<UScrollArea v-if="model.length > 0" v-slot="{ item, index }" orientation="horizontal" :items="model" :ui="{ item: 'ml-2 first:ml-0' }">
			<div
				class="flex flex-col gap-2"
				:class="{ 'pb-2': model.length > 2 }"
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
							<UFieldGroup>
								<InputDatePicker v-model="item.date" />
								<UButton
									color="error"
									icon="hugeicons:delete-02"
									variant="subtle"
									@click="removeImage(index)"
								/>
							</UFieldGroup>
						</UFormField>
					</div>
					<div />
				</div>
			</div>
		</UScrollArea>
	</UFormField>
</template>

  <script setup lang="ts">
	import type { FermentImage } from "~/types/ferment";
	import Compressor from "compressorjs";
	import ExifReader from "exifreader";
	import { getErrorMessage, sortImages } from "~/types/utils";

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
			const processedImages = await Promise.all(files.map(processFile));
			model.value.push(...sortImages(processedImages));
		} catch (error) {
			toast.add({ title: "Error uploading images", description: getErrorMessage(error), color: "error" });
		} finally {
			isLoadingImages.value = false;
		}
	}

	async function processFile(file: File): Promise<FermentImage> {
		const [base64, date] = await Promise.all([
			compressImage(file),
			getImageDate(file)
		]);
		return {
			id: createId(),
			base64,
			date
		};
	}

	async function compressImage(file: File): Promise<string> {
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

	async function getImageDate(file: File): Promise<string> {
		try {
			const exif = await ExifReader.load(file);
			const rawExifDate = (exif.DateTimeOriginal?.description
				?? exif["Date Created"]?.description
				?? exif["Modify Date"]?.description);
			const exifDate = rawExifDate
				?.split(" ")[0]
				?.replace(/:/g, "-");
			return z.iso.date().parse(exifDate ?? getISODate());
		} catch {
			return getISODate();
		}
	}

	function removeImage(index: number) {
		model.value.splice(index, 1);
	}
  </script>
