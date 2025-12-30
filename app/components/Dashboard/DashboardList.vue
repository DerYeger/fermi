<template>
	<UCard>
		<template #header>
			<CardHeader :title="title" :icon="icon" />
		</template>
		<Loader v-if="isLoading" class="p-4" />
		<div v-if="items.length === 0" class="px-4 py-1.5 flex-center text-sm text-muted">
			{{ noItemsText }}
		</div>
		<UScrollArea
			v-else
			v-slot="{ item }"
			:items="items"
			orientation="vertical"
			class="-m-4 p-4 max-h-52 mask-[linear-gradient(to_bottom,transparent,black_1rem,black_calc(100%-1rem),transparent)]"
			:ui="{ item: 'max-w-full not-last:mb-4 h-8 flex gap-2 items-center' }"
		>
			<slot :item="item" />
		</UScrollArea>
	</UCard>
</template>

<script setup lang="ts" generic="T">
	defineProps<{
		title: string
		/**
		 * @IconifyIcon
		 */
		icon: string
		noItemsText: string
		isLoading: boolean
		items: T[]
	}>();

	defineSlots<{
		default: (props: { item: T }) => VNode
	}>();
</script>
