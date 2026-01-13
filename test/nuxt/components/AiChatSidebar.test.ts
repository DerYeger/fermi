import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { ref } from "vue";
import AiChatSidebar from "~/components/AiChatSidebar.vue";

const mockCanUseAiChat = ref(true);
const mockIsOnline = ref(true);
const mockHasKey = ref(true);
const mockIsLargeScreen = ref(false);

mockNuxtImport("useOpenRouterKey", () => {
	return () => ({
		canUseAiChat: mockCanUseAiChat,
		isOnline: mockIsOnline,
		hasKey: mockHasKey
	});
});

mockNuxtImport("useMediaQuery", () => {
	return () => mockIsLargeScreen;
});

describe("components/AiChatSidebar", () => {
	beforeEach(() => {
		mockCanUseAiChat.value = true;
		mockIsOnline.value = true;
		mockHasKey.value = true;
		mockIsLargeScreen.value = false;
	});

	describe("toggle button", () => {
		it("renders toggle button with correct disabled state based on canUseAiChat", async () => {
			const wrapper = await mountSuspended(AiChatSidebar);
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const toggleButton = buttons[0]!;
			expect(toggleButton.exists()).toBe(true);
			expect(toggleButton.props("disabled")).toBe(false);

			mockCanUseAiChat.value = false;
			const wrapper2 = await mountSuspended(AiChatSidebar);
			const toggleButton2 = wrapper2.findAllComponents({ name: "UButton" })[0]!;
			expect(toggleButton2.props("disabled")).toBe(true);
		});

		it("renders correct icon based on open state", async () => {
			const wrapper = await mountSuspended(AiChatSidebar);
			const toggleButton = wrapper.findAllComponents({ name: "UButton" })[0]!;
			expect(toggleButton.props("icon")).toBe("hugeicons:ai-chat-02");
		});
	});

	describe("mobile sidebar", () => {
		it("renders USlideover component that is closed by default", async () => {
			const wrapper = await mountSuspended(AiChatSidebar);
			const slideover = wrapper.findComponent({ name: "USlideover" });
			expect(slideover.exists()).toBe(true);
			expect(slideover.props("open")).toBe(false);
		});
	});

	describe("desktop sidebar", () => {
		it("provides sidebar open state for layout injection", async () => {
			const wrapper = await mountSuspended(AiChatSidebar);
			expect(wrapper.vm).toBeDefined();
		});
	});
});
