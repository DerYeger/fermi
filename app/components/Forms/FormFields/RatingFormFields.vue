<template>
	<UFormField :label="label" :name="name">
		<div class="flex flex-col gap-2 pt-2">
			<UFormField label="Rating" :name="`${name}.stars`">
				<div class="flex">
					<UButton
						v-for="i in 5"
						:key="i"
						variant="ghost"
						icon="lucide:star"
						color="warning"
						class="transition-transform hover:scale-110"
						:class="{ 'text-warning': isStarActive(i), 'text-muted': !isStarActive(i) }"
						@click="onStarClicked(i)"
					/>
				</div>
			</UFormField>
			<UFormField label="Notes" :name="`${name}.notes`">
				<UTextarea
					v-model="notes"
					placeholder="Notes..."
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
	}>();

	const stars = defineModel<number | undefined>("stars", {
		required: true
	});

	function isStarActive(star: number) {
		return stars.value !== undefined && star <= stars.value;
	}

	function onStarClicked(star: number) {
		if (stars.value === star) {
			stars.value = undefined;
		} else {
			stars.value = star;
		}
	}

	const notes = defineModel<string>("notes", { required: true });
</script>
