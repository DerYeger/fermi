<template>
	<div class="flex h-full flex-col">
		<!-- Header -->
		<div class="flex items-center justify-between border-b border-default px-4 py-3 h-12.25">
			<div class="flex items-center gap-2">
				<UIcon name="hugeicons:ai-chat-02" class="size-5" />
				<span class="font-semibold">Fermi Assistant</span>
			</div>
			<div class="flex items-center gap-1 relative">
				<UButton
					v-if="isActiveChatTouched"
					icon="hugeicons:add-01"
					variant="ghost"
					color="neutral"
					size="sm"
					label="New Chat"
					@click="createNewChat"
				/>
				<UPopover>
					<UButton
						v-if="sortedChats.length > 0"
						icon="hugeicons:ai-book"
						variant="ghost"
						color="neutral"
						size="sm"
						title="Chat History"
					/>
					<template #content>
						<div class="flex flex-col gap-2 p-2 max-h-96 w-96 overflow-x-hidden overflow-y-auto">
							<UFieldGroup
								v-for="chatItem in sortedChats"
								:key="chatItem.id"
								class="w-full"
							>
								<UButton
									:disabled="chatItem.id === activeChatId"
									variant="subtle"
									color="neutral"
									class="flex-1"
									@click="selectChat(chatItem.id)"
								>
									<div class="flex flex-col items-start">
										<div class="text-sm max-w-[20ch] font-medium truncate">
											{{ chatItem.title }}
										</div>
										<div class="text-xs text-muted">
											{{ formatDate(chatItem.updatedAt) }}
										</div>
									</div>
								</UButton>
								<UButton
									icon="hugeicons:delete-02"
									variant="subtle"
									color="error"
									title="Delete Chat"
									@click.stop="deleteChat(chatItem.id)"
								/>
							</UFieldGroup>
						</div>
					</template>
				</UPopover>
				<UButton
					icon="hugeicons:cancel-01"
					variant="ghost"
					color="neutral"
					size="sm"
					@click="emit('close')"
				/>
			</div>
		</div>
		<Chat v-if="activeChatId" v-model:is-chat-touched="isActiveChatTouched" :chat-id="activeChatId" />
	</div>
</template>

<script setup lang="ts">
	const emit = defineEmits<{
		(event: "close"): void
	}>();

	const { activeChatId, sortedChats, createNewChat, deleteChat } = useChatHistory();

	const isActiveChatTouched = ref(false);

	function selectChat(chatId: string) {
		activeChatId.value = chatId;
	}
</script>
