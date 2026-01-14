<template>
	<UTooltip :kbds="['meta', 'l']" :content="{ side: 'bottom' }">
		<UButton
			icon="hugeicons:ai-chat-02"
			variant="ghost"
			color="neutral"
			:disabled="!isChatAvailable || isOpen"
			:title="buttonTitle"
			@click="isOpen = !isOpen"
		/>
	</UTooltip>
</template>

<script lang="ts" setup>
	const isOpen = defineModel<boolean>({
		required: true
	});
	const { isChatAvailable, isOnline, hasApiKey } = useChatConfig();

	const buttonTitle = computed(() => {
		if (!isOnline.value) return "AI Chat requires internet connection";
		if (!hasApiKey.value) return "Configure API key in Settings to enable AI Chat";
		return "Open AI Chat";
	});

	defineShortcuts({
		meta_l: () => {
			isOpen.value = !isOpen.value;
		}
	});
</script>
