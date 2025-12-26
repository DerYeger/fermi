<template>
	<UFormField label="Images" name="images">
		<div class="flex flex-wrap gap-2">
			<div v-for="(image, index) of model" :key="index" class="p-1 flex flex-col gap-1 items-center justify-between w-fit">
				<img :src="image.base64" :alt="`Ferment image taken on ${image.date}`" :height="96" :width="96">
				<UButton
					icon="lucide:trash-2"
					label="Remove"
					color="error"
					size="sm"
					@click="model.splice(index, 1)"
				/>
			</div>
		</div>
		<ImageForm @submit="model.push($event)" />
	</UFormField>
</template>

  <script setup lang="ts">
	import type { FermentImage } from "~/types/ferment";
	import ImageForm from "~/components/Forms/FormFields/ImageForm.vue";

	const model = defineModel<FermentImage[]>({
		required: true
	});
  </script>
