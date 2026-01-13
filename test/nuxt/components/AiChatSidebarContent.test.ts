import type { Ferment } from "~/types/ferment";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { computed, ref } from "vue";
import AiChatSidebarContent from "~/components/Chat.vue";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT } from "../../data";

const mockCanUseAiChat = ref(true);
const mockGetKey = vi.fn(() => "sk-or-v1-test123456789");
const mockOpenRouterModel = ref("xiaomi/mimo-v2-flash:free");
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

mockNuxtImport("useOpenRouterKey", () => {
	return () => ({
		canUseAiChat: mockCanUseAiChat,
		getKey: mockGetKey
	});
});

mockNuxtImport("useAiConfig", () => {
	return () => ({
		openRouterModel: mockOpenRouterModel
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

mockNuxtImport("createId", () => {
	let counter = 0;
	return () => `test-id-${++counter}`;
});

describe("components/AiChatSidebarContent", () => {
	beforeEach(() => {
		mockCanUseAiChat.value = true;
		mockSelectedFerment.value = null;
		mockFermentsData.value = [BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT];
	});

	describe("header", () => {
		it("renders header with title and close button", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			expect(wrapper.text()).toContain("Fermentation Assistant");

			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const closeButton = buttons.find((b) => b.props("icon") === "hugeicons:cancel-01");
			expect(closeButton?.exists()).toBe(true);
		});
	});

	describe("empty state", () => {
		it("shows empty state message when no messages exist", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			expect(wrapper.text()).toContain("Ask me anything about fermentation!");
			expect(wrapper.text()).toContain("Select a ferment to get specific advice.");
		});
	});

	describe("ferment selector", () => {
		it("renders ferment selector when ferments are available", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.exists()).toBe(true);
		});

		it("does not render ferment selector when no ferments exist", async () => {
			mockFermentsData.value = [];
			const wrapper = await mountSuspended(AiChatSidebarContent);
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.exists()).toBe(false);
		});

		it("shows context message when a ferment is selected", async () => {
			mockSelectedFerment.value = BASE_ACTIVE_FERMENT;
			const wrapper = await mountSuspended(AiChatSidebarContent);
			expect(wrapper.text()).toContain("Context will be included in your next message.");
		});
	});

	describe("input form", () => {
		it("renders textarea for message input", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			const textarea = wrapper.findComponent({ name: "UTextarea" });
			expect(textarea.exists()).toBe(true);
			expect(textarea.props("placeholder")).toBe("Ask about fermentation...");
		});

		it("renders submit button", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const submitButton = buttons.find((b) => b.props("icon") === "hugeicons:sent");
			expect(submitButton?.exists()).toBe(true);
			expect(submitButton?.props("type")).toBe("submit");
		});

		it("disables submit button when input is empty", async () => {
			const wrapper = await mountSuspended(AiChatSidebarContent);
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const submitButton = buttons.find((b) => b.props("icon") === "hugeicons:sent");
			expect(submitButton?.props("disabled")).toBe(true);
		});
	});
});
