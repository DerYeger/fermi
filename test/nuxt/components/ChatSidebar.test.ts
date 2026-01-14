import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ChatSidebar from "~/components/ChatSidebar.vue";

const mockIsLargeScreen = ref(false);
const mockActiveChatId = ref<string | null>(null);
const mockSortedChats = ref<any[]>([]);
const mockCreateNewChat = vi.fn();
const mockDeleteChat = vi.fn();

mockNuxtImport("useMediaQuery", () => {
	return () => mockIsLargeScreen;
});

mockNuxtImport("useChatHistory", () => {
	return () => ({
		activeChatId: mockActiveChatId,
		sortedChats: mockSortedChats,
		createNewChat: mockCreateNewChat,
		deleteChat: mockDeleteChat,
		getChat: vi.fn(() => null),
		saveChat: vi.fn()
	});
});

describe("components/ChatSidebar", () => {
	afterEach(() => {
		mockIsLargeScreen.value = false;
		mockActiveChatId.value = null;
		mockSortedChats.value = [];
	});

	describe("header", () => {
		it("renders header with title and close button", async () => {
			const wrapper = await mountSuspended(ChatSidebar);
			expect(wrapper.text()).toContain("Fermi Assistant");

			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const closeButton = buttons.find((b) => b.props("icon") === "hugeicons:cancel-01");
			expect(closeButton?.exists()).toBe(true);
		});

		it("renders close button", async () => {
			const wrapper = await mountSuspended(ChatSidebar);
			const closeButton = wrapper.findAllComponents({ name: "UButton" }).find((b) => b.props("icon") === "hugeicons:cancel-01");
			expect(closeButton?.exists()).toBe(true);
		});
	});

	describe("chat history", () => {
		it("renders chat history popover when chats exist", async () => {
			mockSortedChats.value = [{ id: "1", title: "Test Chat", updatedAt: new Date().toISOString() }];
			const wrapper = await mountSuspended(ChatSidebar);
			const popover = wrapper.findComponent({ name: "UPopover" });
			expect(popover.exists()).toBe(true);
		});
	});

	describe("chat component", () => {
		it("renders Chat component when activeChatId is set", async () => {
			mockActiveChatId.value = "test-chat-id";
			const wrapper = await mountSuspended(ChatSidebar);
			const chatComponent = wrapper.findComponent({ name: "Chat" });
			expect(chatComponent.exists()).toBe(true);
			expect(chatComponent.props("chatId")).toBe("test-chat-id");
		});

		it("does not render Chat component when no activeChatId", async () => {
			const wrapper = await mountSuspended(ChatSidebar);
			const chatComponent = wrapper.findComponent({ name: "Chat" });
			expect(chatComponent.exists()).toBe(false);
		});
	});
});
