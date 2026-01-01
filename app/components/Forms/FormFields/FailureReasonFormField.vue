<template>
	<UFormField
		name="reason"
		label="Reason"
	>
		<UTextarea
			v-model="reason"
			placeholder="Reason..."
			:rows="4"
			:maxlength="MAX_NOTES_LENGTH"
		/>
	</UFormField>
</template>

<script lang="ts" setup>
	import { MAX_NOTES_LENGTH } from "~/types/ferment";

	const reason = defineModel<string>({
		required: true
	});
</script>
