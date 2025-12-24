<template>
	<form class="space-y-6" @submit.prevent="handleSubmit">
		<p class="text-(--ui-text-muted)">
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
						:class="i <= rating ? 'text-yellow-500' : 'text-(--ui-text-muted)'"
						class="size-8"
					/>
				</button>
				<span class="ml-2 text-sm text-(--ui-text-muted)">{{ rating }}/5</span>
			</div>
		</UFormField>

		<!-- Notes -->
		<UFormField label="Final Notes (optional)" name="notes">
			<UTextarea
				v-model="notes"
				placeholder="How did it turn out? Any lessons learned?"
				:rows="4"
			/>
		</UFormField>

		<!-- Actions -->
		<div class="flex justify-end gap-3 pt-4 border-t border-(--ui-border)">
			<UButton variant="ghost" @click="$emit('cancel')">
				Cancel
			</UButton>
			<UButton type="submit">
				Complete Ferment
			</UButton>
		</div>
	</form>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";

	const props = defineProps<{
		ferment: Ferment
	}>();

	const emit = defineEmits<{
		submit: [data: { rating: number, notes: string }]
		cancel: []
	}>();

	const rating = ref(props.ferment.rating || 3);
	const notes = ref(props.ferment.completionNotes || "");

	const handleSubmit = () => {
		emit("submit", {
			rating: rating.value,
			notes: notes.value
		});
	};
</script>
