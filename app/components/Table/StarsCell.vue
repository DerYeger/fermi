<template>
	<div class="flex items-center h-full">
		<UIcon v-for="n in 5" :key="n" name="lucide:star" :class="{ 'text-yellow-500': isActive(n), 'text-muted': !isActive(n) }" class="inline-block size-4" />
	</div>
</template>

<script lang="ts" setup>
	const { stars } = defineProps<{
		stars: number | null
	}>();

	function isActive(n: number) {
		return stars !== null && n <= stars;
	}
</script>
