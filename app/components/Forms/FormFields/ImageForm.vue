<template>
	<UFileUpload v-model="imageInput" accept="image/*" />
	<div class="flex items-center gap-2 mt-2">
		<div>
			<UInput v-model="imageDate" type="date" />
		</div>
		<UTooltip :disabled="imageInput && isImageDateValid" :text="!imageInput ? 'Select an image' : 'Provide a valid date'">
			<UButton :disabled="!imageInput || !isImageDateValid" variant="outline" icon="lucide:plus" @click="addImage">
				Add image
			</UButton>
		</UTooltip>
	</div>
</template>

  <script lang="ts" setup>
	import type { FermentImage } from "~/types/ferment";
	import Compressor from "compressorjs";
	import { nanoid } from "nanoid";

	const emit = defineEmits<{
		submit: [data: FermentImage]
	}>();
	const imageInput = ref<File>();
	const imageDate = ref<string>(getISODate());
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
		emit("submit", {
			id: nanoid(),
			base64,
			date: imageDate.value
		});
		imageInput.value = undefined;
		imageDate.value = getISODate();
	}
  </script>
