import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";
import ChatButton from "~/components/ChatButton.vue";

const mockIsChatAvailable = ref(true);
const mockIsOnline = ref(true);
const mockHasApiKey = ref(true);

mockNuxtImport("useChatConfig", () => {
	return () => ({
		isChatAvailable: mockIsChatAvailable,
		isOnline: mockIsOnline,
		hasApiKey: mockHasApiKey
	});
});

mockNuxtImport("defineShortcuts", () => {
	return vi.fn();
});

describe("components/ChatButton", () => {
	afterEach(() => {
		mockIsChatAvailable.value = true;
		mockIsOnline.value = true;
		mockHasApiKey.value = true;
	});

	describe("rendering", () => {
		it("renders UButton with correct icon", async () => {
			const wrapper = await mountSuspended(ChatButton, {
				props: { modelValue: false },
				global: {
					stubs: {
						UTooltip: {
							template: "<div><slot /></div>"
						}
					}
				}
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.exists()).toBe(true);
			expect(button.props("icon")).toBe("hugeicons:ai-chat-02");
		});
	});

	describe("button state", () => {
		it("is enabled when chat is available and not open", async () => {
			const wrapper = await mountSuspended(ChatButton, {
				props: { modelValue: false },
				global: {
					stubs: {
						UTooltip: {
							template: "<div><slot /></div>"
						}
					}
				}
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("disabled")).toBe(false);
		});

		it("is disabled when chat is not available", async () => {
			mockIsChatAvailable.value = false;
			const wrapper = await mountSuspended(ChatButton, {
				props: { modelValue: false },
				global: {
					stubs: {
						UTooltip: {
							template: "<div><slot /></div>"
						}
					}
				}
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("disabled")).toBe(true);
		});

		it("is disabled when chat is open", async () => {
			const wrapper = await mountSuspended(ChatButton, {
				props: { modelValue: true },
				global: {
					stubs: {
						UTooltip: {
							template: "<div><slot /></div>"
						}
					}
				}
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("disabled")).toBe(true);
		});
	});

	describe("click behavior", () => {
		it("toggles model value on click", async () => {
			const wrapper = await mountSuspended(ChatButton, {
				props: { modelValue: false },
				global: {
					stubs: {
						UTooltip: {
							template: "<div><slot /></div>"
						}
					}
				}
			});
			const button = wrapper.findComponent({ name: "UButton" });
			await button.vm.$emit("click");
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			expect(wrapper.emitted("update:modelValue")![0]).toEqual([true]);
		});
	});
});
