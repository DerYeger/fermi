<template>
	<UFormField label="Notes" name="notes">
		<UTextarea
			v-model="model"
			placeholder="Notes..."
			:rows="4"
			:maxlength="MAX_NOTES_LENGTH"
		/>
	</UFormField>
</template>

<script lang="ts" setup>
	import { MAX_NOTES_LENGTH } from "~/types/ferment";

	const model = defineModel<string>({
		required: true
	});
</script>
