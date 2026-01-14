import type { UIMessage } from "ai";
import type { ChatHistory } from "~/composables/chatHistory";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import { useChatHistory } from "~/composables/chatHistory";

let idCounter = 0;
const mockStoredHistory = ref<ChatHistory>({ activeChatId: null, chats: {} });

mockNuxtImport("useLocalStorageSchema", () => {
	return vi.fn(() => mockStoredHistory);
});

mockNuxtImport("createId", () => {
	return () => `test-id-${++idCounter}`;
});

describe("composables/chatHistory", () => {
	afterEach(() => {
		mockStoredHistory.value = {
			activeChatId: null,
			chats: {}
		};
		idCounter = 0;
	});

	describe("initial state", () => {
		it("returns default state when no history exists", () => {
			const { chats, sortedChats } = useChatHistory();
			expect(chats.value).toEqual({});
			expect(sortedChats.value).toEqual([]);
		});
	});

	describe("activeChatId", () => {
		it("sets activeChatId when assigned", () => {
			const { activeChatId } = useChatHistory();
			activeChatId.value = "test-chat";
			expect(activeChatId.value).toBe("test-chat");
			expect(mockStoredHistory.value.activeChatId).toBe("test-chat");
		});
	});

	describe("getChat", () => {
		it("returns chat data for existing chat", () => {
			const chatData = {
				id: "chat1",
				title: "Test Chat",
				createdAt: "2023-01-01T00:00:00.000Z",
				updatedAt: "2023-01-01T00:00:00.000Z",
				messages: []
			};
			mockStoredHistory.value.chats = { chat1: chatData };
			const { getChat } = useChatHistory();
			expect(getChat("chat1")).toEqual(chatData);
		});

		it("returns undefined for non-existing chat", () => {
			const { getChat } = useChatHistory();
			expect(getChat("nonexistent")).toBeUndefined();
		});
	});

	describe("saveChat", () => {
		it("saves new chat with generated title", () => {
			const { saveChat } = useChatHistory();
			const messages: UIMessage[] = [{ id: "msg1", role: "user", parts: [{ type: "text", text: "Hello world" }] }];
			saveChat("new-chat", messages as any);
			expect((mockStoredHistory.value.chats as any)["new-chat"]).toMatchObject({
				id: "new-chat",
				title: "Hello world",
				messages
			});
		});

		it("updates existing chat", () => {
			(mockStoredHistory.value.chats as any)["existing-chat"] = {
				id: "existing-chat",
				title: "Old Title",
				createdAt: "2023-01-01T00:00:00.000Z",
				updatedAt: "2023-01-01T00:00:00.000Z",
				messages: []
			};
			const { saveChat } = useChatHistory();
			const messages: UIMessage[] = [{ id: "msg2", role: "user", parts: [{ type: "text", text: "Updated message" }] }];
			saveChat("existing-chat", messages as any);
			expect((mockStoredHistory.value.chats as any)["existing-chat"].title).toBe("Updated message");
		});

		it("keeps only the 10 most recent chats", async () => {
			const { saveChat, chats } = useChatHistory();
			const messages: UIMessage[] = [{ id: "msg", role: "user", parts: [{ type: "text", text: "Test" }] }];

			// Create 10 chats with delays to ensure different timestamps
			for (let i = 0; i < 10; i++) {
				saveChat(`chat-${i}`, messages as any);
				await new Promise((resolve) => setTimeout(resolve, 2));
			}

			expect(Object.keys(chats.value)).toHaveLength(10);

			// Adding 11th chat should trigger deletion of oldest (chat-0)
			await new Promise((resolve) => setTimeout(resolve, 2));
			saveChat("chat-10", messages as any);

			expect(Object.keys(chats.value)).toHaveLength(10);
			expect(chats.value["chat-0"]).toBeUndefined();
			expect(chats.value["chat-10"]).toBeDefined();
		});

		it("deletes oldest chats based on updatedAt timestamp", async () => {
			const { saveChat, chats } = useChatHistory();
			const messages: UIMessage[] = [{ id: "msg", role: "user", parts: [{ type: "text", text: "Test" }] }];

			// Create 11 chats initially to trigger deletion
			for (let i = 0; i < 11; i++) {
				const day = String(i + 1).padStart(2, "0");
				mockStoredHistory.value.chats[`chat-${i}`] = {
					id: `chat-${i}`,
					title: `Chat ${i}`,
					createdAt: `2023-01-${day}T00:00:00.000Z`,
					updatedAt: `2023-01-${day}T00:00:00.000Z`,
					messages: []
				};
			}

			// Update an old chat to make it recent - this should trigger deletion
			await new Promise((resolve) => setTimeout(resolve, 2));
			saveChat("chat-2", messages as any);

			expect(Object.keys(chats.value)).toHaveLength(10);
			// chat-0 should be deleted (oldest)
			expect(chats.value["chat-0"]).toBeUndefined();
			// chat-2 should still exist (was updated recently)
			expect(chats.value["chat-2"]).toBeDefined();
		});
	});

	describe("deleteChat", () => {
		it("deletes existing chat", () => {
			mockStoredHistory.value.chats = {
				chat1: {
					id: "chat1",
					title: "Test Chat",
					createdAt: "2023-01-01T00:00:00.000Z",
					updatedAt: "2023-01-01T00:00:00.000Z",
					messages: []
				}
			};
			const { deleteChat, chats } = useChatHistory();
			deleteChat("chat1");
			expect(chats.value.chat1).toBeUndefined();
		});

		it("sets activeChatId to null when deleting active chat", () => {
			mockStoredHistory.value.activeChatId = "chat1";
			mockStoredHistory.value.chats = {
				chat1: {
					id: "chat1",
					title: "Test Chat",
					createdAt: "2023-01-01T00:00:00.000Z",
					updatedAt: "2023-01-01T00:00:00.000Z",
					messages: []
				}
			};
			const { deleteChat, activeChatId } = useChatHistory();
			deleteChat("chat1");
			expect(activeChatId.value).toBeNull();
		});
	});

	describe("createNewChat", () => {
		it("creates new chat and sets as active", () => {
			const { createNewChat, activeChatId } = useChatHistory();
			createNewChat();
			expect(activeChatId.value).toBe("test-id-2");
		});
	});

	describe("sortedChats", () => {
		it("sorts chats by updatedAt descending", () => {
			mockStoredHistory.value.chats = {
				chat1: {
					id: "chat1",
					title: "Old Chat",
					createdAt: "2023-01-01T00:00:00.000Z",
					updatedAt: "2023-01-01T00:00:00.000Z",
					messages: []
				},
				chat2: {
					id: "chat2",
					title: "Recent Chat",
					createdAt: "2023-01-02T00:00:00.000Z",
					updatedAt: "2023-01-02T00:00:00.000Z",
					messages: []
				}
			};
			const { sortedChats } = useChatHistory();
			expect(sortedChats.value).toHaveLength(2);
			expect((sortedChats.value as any)[0].id).toBe("chat2");
			expect((sortedChats.value as any)[1].id).toBe("chat1");
		});
	});
});
