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
						<div class="flex items-center gap-1 relative">
							<UButton
								v-if="isActiveChatTouched"
								icon="hugeicons:add-01"
								variant="ghost"
								color="neutral"
								size="sm"
								title="New Chat"
								@click="createNewChat"
							/>
							<UPopover>
								<UButton
									v-if="chats && Object.keys(chats).length > 0"
									icon="hugeicons:ai-book"
									variant="ghost"
									color="neutral"
									size="sm"
									title="Chat History"
								/>
								<template #content>
									<div class="flex flex-col gap-2 p-2 max-h-64 overflow-y-auto">
										<div
											v-for="chatItem in sortedChats"
											:key="chatItem.id"
											class="flex items-center justify-between gap-2 p-2 rounded hover:bg-muted cursor-pointer"
											:class="{ 'bg-muted': chatItem.id === activeChatId }"
											@click="selectChat(chatItem.id)"
										>
											<div class="flex-1 min-w-0">
												<p class="text-sm font-medium truncate">
													{{ chatItem.title }}
												</p>
												<p class="text-xs text-muted">
													{{ formatDate(chatItem.updatedAt) }}
												</p>
											</div>
											<UButton
												icon="hugeicons:delete-02"
												variant="ghost"
												color="error"
												size="xs"
												title="Delete Chat"
												@click.stop="deleteChat(chatItem.id)"
											/>
										</div>
									</div>
								</template>
							</UPopover>
							<UButton
								icon="hugeicons:cancel-01"
								variant="ghost"
								color="neutral"
								size="sm"
								@click="isOpen = false"
							/>
						</div>
					</div>
					<Chat v-if="activeChatId" v-model:is-chat-touched="isActiveChatTouched" :chat-id="activeChatId" />
				</div>
			</template>
		</USlideover>
	</div>
</template>

<script setup lang="ts">
	const { isChatAvailable, isOnline, hasApiKey } = useChatConfig();
	const { activeChatId, chats, createNewChat, deleteChat } = useChatHistory();

	const isOpen = ref(false);
	const isActiveChatTouched = ref(false);

	const buttonTitle = computed(() => {
		if (!isOnline.value) return "AI Chat requires internet connection";
		if (!hasApiKey.value) return "Configure API key in Settings to enable AI Chat";
		return "Open AI Chat";
	});

	const sortedChats = computed(() => {
		return Object.values(chats.value).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
	});

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString();
	}

	function selectChat(chatId: string) {
		activeChatId.value = chatId;
	}

	function toggleSidebar() {
		isOpen.value = !isOpen.value;
	}

	watch(isOpen, (newVal) => {
		if (newVal && !activeChatId.value) {
			// If opening and no active chat, set to most recent or create new
			const recent = sortedChats.value[0];
			if (recent) {
				activeChatId.value = recent.id;
			} else {
				createNewChat();
			}
		}
	});

	defineShortcuts({
		meta_l: () => {
			isOpen.value = !isOpen.value;
		}
	});
</script>
