<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<p class="text-muted">
			Mark "{{ ferment.name }}" as complete. Rate your ferment and add any final notes.
		</p>

		<!-- Rating -->
		<UFormField label="Rating" name="rating">
			<div class="flex items-center gap-2">
				<button
					v-for="i in 5"
					:key="i"
					type="button"
					class="p-1 transition-transform hover:scale-110"
					@click="rating = i"
				>
					<UIcon
						name="lucide:star"
						:class="i <= (rating ?? 0) ? 'text-yellow-500' : 'text-muted'"
						class="size-8"
					/>
				</button>
			</div>
		</UFormField>

		<!-- Notes -->
		<UFormField label="Final notes (optional)" name="notes">
			<UTextarea
				v-model="completionNotes"
				placeholder="How did it turn out? Any lessons learned?"
				:rows="4"
			/>
		</UFormField>

		<!-- Actions -->
		<div class="flex justify-end gap-3 pt-4 border-t border-default">
			<UButton variant="ghost" @click="$emit('cancel')">
				Cancel
			</UButton>
			<UButton type="submit">
				Complete ferment
			</UButton>
		</div>
	</form>
</template>

<script lang="ts" setup>
	import type { ActiveFerment, CompletedFerment } from "~/types/ferment";

	const { ferment } = defineProps<{
		ferment: ActiveFerment
	}>();

	const emit = defineEmits<{
		submit: [data: CompletedFerment]
		cancel: []
	}>();

	const rating = ref<number>();
	const completionNotes = ref("");

	function handleSubmit() {
		const completedFerment: CompletedFerment = {
			...ferment,
			state: "completed",
			endDate: ferment.endDate ?? getISODate(),
			overall: {
				stars: rating.value,
				notes: completionNotes.value
			},
			flavor: {
				stars: undefined,
				notes: undefined
			},
			texture: {
				stars: undefined,
				notes: undefined
			},
			process: {
				stars: undefined,
				notes: undefined
			},
			notes: completionNotes.value
		};
		emit("submit", completedFerment);
	}
</script>
