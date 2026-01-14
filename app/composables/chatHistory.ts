import type { InferUITools, UIMessage } from "ai";
import { z } from "zod";

// eslint-disable-next-line ts/no-empty-object-type
type ChatDataMessage = UIMessage<unknown, never, InferUITools<{}>>;

export const ChatDataSchema = z.object({
	id: z.string(),
	title: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	messages: z.array(z.custom<ChatDataMessage>())
});

export type ChatData = z.infer<typeof ChatDataSchema>;

export const ChatHistorySchema = z.object({
	activeChatId: z.string().nullable(),
	chats: z.record(
		z.string(),
		ChatDataSchema
	)
});

export type ChatHistory = z.infer<typeof ChatHistorySchema>;

const CHAT_HISTORY_DEFAULTS: ChatHistory = {
	activeChatId: null,
	chats: {}
};

export const useChatHistory = createGlobalState(() => {
	const storedHistory = useLocalStorageSchema("fermiChatHistory:v1", ChatHistorySchema, CHAT_HISTORY_DEFAULTS);

	const parsedHistory = computed(() => {
		try {
			return ChatHistorySchema.parse(storedHistory.value);
		} catch {
			// Reset on parse error
			storedHistory.value = CHAT_HISTORY_DEFAULTS;
			return CHAT_HISTORY_DEFAULTS;
		}
	});

	const chats = computed(() => parsedHistory.value.chats);

	const sortedChats = computed(() => {
		return Object.values(chats.value).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
	});

	const activeChatId = computed<string | null>({
		get: () => parsedHistory.value.activeChatId,
		set: (value: string | null) => {
			storedHistory.value.activeChatId = value;
		}
	});

	watch(activeChatId, (newId) => {
		if (newId) {
			return;
		}
		const mostRecentChat = sortedChats.value[0];
		if (mostRecentChat) {
			activeChatId.value = mostRecentChat.id;
		} else {
			createNewChat();
		}
	}, { immediate: true });

	function getChat(chatId: string): ChatData | undefined {
		return chats.value[chatId];
	}

	function saveChat(chatId: string, messages: ChatDataMessage[], title?: string) {
		const existing = chats.value[chatId];
		const now = new Date().toISOString();
		const newTitle = title || generateTitle(messages);
		if (existing) {
			storedHistory.value.chats[chatId] = {
				...existing,
				title: newTitle,
				updatedAt: now,
				messages: [...messages]
			};
		} else {
			storedHistory.value.chats[chatId] = {
				id: chatId,
				title: newTitle,
				createdAt: now,
				updatedAt: now,
				messages: [...messages]
			};
		}

		// Keep only the 10 most recent chats
		const MAX_CHATS = 10;
		const allChats = Object.values(storedHistory.value.chats).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
		if (allChats.length > MAX_CHATS) {
			const chatsToDelete = allChats.slice(MAX_CHATS);
			for (const chat of chatsToDelete) {
				delete storedHistory.value.chats[chat.id];
			}
		}
	}

	function deleteChat(chatId: string) {
		if (storedHistory.value.chats[chatId]) {
			delete storedHistory.value.chats[chatId];
			if (activeChatId.value === chatId) {
				activeChatId.value = null;
			}
		}
	}

	function createNewChat() {
		activeChatId.value = createId();
	}

	function generateTitle(messages: ChatDataMessage[]): string {
		const firstUserMessage = messages.find((message) => message.role === "user");
		if (!firstUserMessage) return "New Chat";
		const textPart = firstUserMessage.parts.find((part) => part.type === "text");
		if (!textPart) return "New Chat";
		return textPart.text.trim().slice(0, 40) || "New Chat";
	}

	return {
		activeChatId,
		chats,
		sortedChats,
		getChat,
		saveChat,
		deleteChat,
		createNewChat
	};
});
