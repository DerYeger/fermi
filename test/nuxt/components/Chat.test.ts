import type { UIMessage } from "ai";
import type { FermentSearchToolInvocation } from "~/composables/chatTools";
import type { Ferment } from "~/types/ferment";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import Chat from "~/components/Chat.vue";
import FermentSearchResults from "~/components/Tools/FermentSearchResults.vue";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT } from "../../data";

const mockIsChatAvailable = ref(true);
const mockGetKey = vi.fn(() => "sk-or-v1-test123456789");
const mockModelId = ref("xiaomi/mimo-v2-flash:free");
const mockFermentsData = ref<Ferment[]>([BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT]);
const mockSelectedFerment = ref<Ferment | null>(null);
const mockHasSelection = computed(() => mockSelectedFerment.value !== null);
const mockSelectFerment = vi.fn((ferment: Ferment) => {
	mockSelectedFerment.value = ferment;
});
const mockClearSelection = vi.fn(() => {
	mockSelectedFerment.value = null;
});
const mockConsumeSelectionForNextSend = vi.fn(() => {
	const ferment = mockSelectedFerment.value;
	mockSelectedFerment.value = null;
	return ferment ? { id: ferment.id, name: ferment.name } : null;
});
const mockChat = ref({
	messages: [] as UIMessage[],
	status: "idle" as const,
	error: null,
	lastMessage: undefined,
	stop: vi.fn(),
	regenerate: vi.fn()
});
const mockInput = ref("");
const mockOnSubmit = vi.fn();

mockNuxtImport("useChatConfig", () => {
	return () => ({
		isChatAvailable: mockIsChatAvailable,
		getKey: mockGetKey,
		modelId: mockModelId
	});
});

mockNuxtImport("useFerments", () => {
	return () => ({
		data: mockFermentsData
	});
});

mockNuxtImport("useChatFermentContext", () => {
	return () => ({
		selectFerment: mockSelectFerment,
		clearSelection: mockClearSelection,
		consumeSelectionForNextSend: mockConsumeSelectionForNextSend,
		hasSelection: mockHasSelection,
		selectedFerment: mockSelectedFerment
	});
});

mockNuxtImport("useChat", () => {
	return () => ({
		chat: mockChat,
		input: mockInput,
		onSubmit: mockOnSubmit
	});
});

mockNuxtImport("useChatHistory", () => {
	return () => ({
		getChat: vi.fn(() => null),
		saveChat: vi.fn()
	});
});

describe("components/Chat", () => {
	afterEach(() => {
		mockIsChatAvailable.value = true;
		mockSelectedFerment.value = null;
		mockFermentsData.value = [BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT];
		mockChat.value = {
			messages: [],
			status: "idle" as const,
			error: null,
			lastMessage: undefined,
			stop: vi.fn(),
			regenerate: vi.fn()
		};
		mockInput.value = "";
	});

	describe("empty state", () => {
		it("shows empty state message when no messages exist", async () => {
			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: false }
			});
			expect(wrapper.text()).toContain("Ask me anything about fermentation or select a ferment to get specific advice.");
			expect(wrapper.text()).toContain("AI may produce incorrect or misleading information.");
		});
	});

	describe("ferment selector", () => {
		it("renders ferment selector when ferments are available", async () => {
			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: false }
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.exists()).toBe(true);
			expect(selectMenu.props("placeholder")).toBe("Select ferment for context...");
		});

		it("renders ferment selector even when no ferments exist", async () => {
			mockFermentsData.value = [];
			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: false }
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.exists()).toBe(true);
		});
	});

	describe("input form", () => {
		it("renders chat prompt for message input", async () => {
			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: false }
			});
			const chatPrompt = wrapper.findComponent({ name: "UChatPrompt" });
			expect(chatPrompt.exists()).toBe(true);
		});
	});

	describe("ferment suggestions", () => {
		it("does not render ferment search results when message has no ferment data", async () => {
			mockChat.value.messages = [
				{
					id: "msg-1",
					role: "assistant",
					parts: [{ type: "text", text: "Hello!" }]
				}
			];

			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: true }
			});

			const searchResults = wrapper.findComponent(FermentSearchResults);
			expect(searchResults.exists()).toBe(false);
		});

		it("renders ferment search results when message has ferment data", async () => {
			const testInvocation: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Kimchi", state: "active", startDate: "2024-01-01", endDate: null },
						{ id: "ferment-2", name: "Sauerkraut", state: "completed", startDate: "2024-01-01", endDate: "2024-01-15" }
					],
					total: 2
				}
			};
			mockChat.value.messages = [
				{
					id: "msg-1",
					role: "assistant",
					parts: [
						testInvocation as never
					]
				}
			];

			const wrapper = await mountSuspended(Chat, {
				props: { chatId: "test-chat", isChatTouched: true }
			});

			const searchResults = wrapper.findComponent(FermentSearchResults);
			expect(searchResults.exists()).toBe(true);
			expect(searchResults.props("part")).toStrictEqual(testInvocation);
		});
	});
});
