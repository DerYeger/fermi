<template>
	<div>
		<UTooltip :kbds="['meta', 'l']" :content="{ side: 'bottom' }">
			<UButton
				:icon="isOpen ? 'hugeicons:cancel-01' : 'hugeicons:ai-chat-02'"
				variant="ghost"
				color="neutral"
				:disabled="!isChatAvailable"
				:title="buttonTitle"
				@click="toggleSidebar"
			/>
		</UTooltip>

		<USlideover v-model:open="isOpen" side="right" :ui="{ content: 'max-w-md' }">
			<template #content>
				<div class="flex h-full flex-col">
					<!-- Header -->
					<div class="flex items-center justify-between border-b border-default px-4 py-3 h-12.25">
						<div class="flex items-center gap-2">
							<UIcon name="hugeicons:ai-chat-02" class="size-5" />
							<span class="font-semibold">Fermentation Assistant</span>
						</div>
						<UButton
							icon="hugeicons:cancel-01"
							variant="ghost"
							color="neutral"
							size="sm"
							@click="isOpen = false"
						/>
					</div>
					<Chat />
				</div>
			</template>
		</USlideover>
	</div>
</template>

<script setup lang="ts">
	const { isChatAvailable, isOnline, hasApiKey } = useChatConfig();

	const isOpen = ref(false);

	const buttonTitle = computed(() => {
		if (!isOnline.value) return "AI Chat requires internet connection";
		if (!hasApiKey.value) return "Configure API key in Settings to enable AI Chat";
		return "Open AI Chat";
	});

	function toggleSidebar() {
		isOpen.value = !isOpen.value;
	}

	defineShortcuts({
		meta_l: () => {
			isOpen.value = !isOpen.value;
		}
	});
</script>
