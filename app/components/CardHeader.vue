<template>
	<div class="flex items-center gap-3">
		<UIcon v-if="icon" :name="icon" class="size-4" />
		<span class="font-semibold truncate">{{ title }}</span>
	</div>
</template>

<script setup lang="ts">
	defineProps<{
		icon?: string
		title: string
	}>();
</script>
