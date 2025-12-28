<template>
	<UFormField :label="label" :name="name">
		<div class="flex flex-col gap-2">
			<UFormField :name="`${name}.stars`">
				<div class="flex">
					<UButton
						v-for="i in 5"
						:key="i"
						variant="ghost"
						icon="lucide:star"
						:color="isStarActive(i) ? 'warning' : 'neutral'"
						class="transition-transform hover:scale-110"
						@click="onStarClicked(i)"
					/>
				</div>
			</UFormField>
			<UFormField :name="`${name}.notes`">
				<UTextarea
					v-model="notes"
					:placeholder="`${placeholder}...`"
					:rows="4"
					:maxlength="MAX_NOTES_LENGTH"
				/>
			</UFormField>
		</div>
	</UFormField>
</template>

<script lang="ts" setup>
	import { MAX_NOTES_LENGTH } from "~/types/ferment";

	defineProps<{
		name: string
		label: string
		placeholder: string
	}>();

	const stars = defineModel<number | null>("stars", {
		required: true
	});

	function isStarActive(star: number) {
		return stars.value !== null && star <= stars.value;
	}

	function onStarClicked(star: number) {
		if (stars.value === star) {
			stars.value = null;
		} else {
			stars.value = star;
		}
	}

	const notes = defineModel<string>("notes", { required: true });
</script>
