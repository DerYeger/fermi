<template>
	<DashboardList
		v-slot="{ item }"
		:title="title"
		:icon="icon"
		:is-loading="isLoading"
		:items="items"
		:no-items-text="noItemsText"
	>
		<UButton color="neutral" icon="hugeicons:view" variant="link" class="w-full flex items-center justify-between gap-2" :to="`/ferments/${item.id}`">
			<div class="flex-1 truncate">
				{{ item.name }}
			</div>
			<slot :ferment="item" />
		</UButton>
	</DashboardList>
</template>

<script setup lang="ts">
	import type { Ferment } from "~/types/ferment";
	import DashboardList from "~/components/Dashboard/DashboardList.vue";

	defineProps<{
		title: string
		/**
		 * @IconifyIcon
		 */
		icon: string
		noItemsText: string
		isLoading: boolean
		items: Ferment[]
	}>();

	defineSlots<{
		default: (props: { ferment: Ferment }) => VNode
	}>();
</script>
