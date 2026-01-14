<template>
	<div v-if="part.output?.ferments?.length" class="flex gap-1 flex-wrap py-2">
		<UButton
			v-for="result of part.output.ferments"
			:key="result.id" size="xs"
			:color="getFermentButtonColor(result.state)"
			variant="subtle" @click="navigateToFerment(result.id)"
		>
			{{ result.name }}
		</UButton>
	</div>
</template>

<script lang="ts" setup>
	import type { FermentState } from "~/types/ferment";

	defineProps<{
		part: FermentSearchToolInvocation
	}>();

	function navigateToFerment(id: string) {
		navigateTo(`/ferments/${id}`);
	}

	function getFermentButtonColor(state: FermentState) {
		switch (state) {
		case "active":
			return "primary";
		case "completed":
			return "warning";
		case "failed":
			return "error";
		default:
			return "neutral";
		}
	}
</script>
