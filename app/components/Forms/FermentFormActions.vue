<template>
	<div class="flex justify-end gap-2">
		<UButton variant="ghost" color="neutral" @click="emit('cancel')">
			Cancel
		</UButton>
		<UButton variant="subtle" type="submit">
			{{ submitLabel }}
		</UButton>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		submitLabel: string
	}>();
	const emit = defineEmits<{
		cancel: []
	}>();
</script>
