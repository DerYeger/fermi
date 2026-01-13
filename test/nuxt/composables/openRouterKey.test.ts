import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it } from "vitest";
import { ref } from "vue";

// Mock storage value object
const mockStorageValue = ref({
	openRouterApiKey: undefined as string | undefined,
	openRouterModel: "xiaomi/mimo-v2-flash:free"
});
const mockOnlineValue = ref(true);

mockNuxtImport("useLocalStorage", () => {
	return (_key: string, _defaultValue: unknown) => mockStorageValue;
});

mockNuxtImport("useOnline", () => {
	return () => mockOnlineValue;
});

describe("composables/openRouterKey", () => {
	beforeEach(() => {
		// Reset mock values before each test
		mockStorageValue.value = {
			openRouterApiKey: undefined,
			openRouterModel: "xiaomi/mimo-v2-flash:free"
		};
		mockOnlineValue.value = true;
	});

	describe("useOpenRouterKey", () => {
		it("should set and get API key", async () => {
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { setKey, getKey, hasKey } = useOpenRouterKey();

			expect(getKey()).toBeUndefined();
			expect(hasKey.value).toBe(false);

			setKey("sk-or-v1-test123456789");
			expect(getKey()).toBe("sk-or-v1-test123456789");
			expect(hasKey.value).toBe(true);
		});

		it("should trim whitespace from keys", async () => {
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { setKey, getKey } = useOpenRouterKey();

			setKey("  sk-or-v1-test123  ");
			expect(getKey()).toBe("sk-or-v1-test123");
		});

		it("should treat empty or whitespace-only keys as undefined", async () => {
			mockStorageValue.value.openRouterApiKey = "existing-key";
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { setKey, getKey, hasKey } = useOpenRouterKey();

			setKey("   ");
			expect(getKey()).toBeUndefined();
			expect(hasKey.value).toBe(false);
		});

		it("should delete API key", async () => {
			mockStorageValue.value.openRouterApiKey = "sk-or-v1-test123456789";
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { deleteKey, getKey, hasKey } = useOpenRouterKey();

			expect(hasKey.value).toBe(true);
			deleteKey();
			expect(getKey()).toBeUndefined();
			expect(hasKey.value).toBe(false);
		});

		it("should return masked key with first 4 chars visible", async () => {
			mockStorageValue.value.openRouterApiKey = "sk-or-v1-test123456789";
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { getMasked } = useOpenRouterKey();

			const masked = getMasked();
			expect(masked).toMatch(/^sk-o•{20}$/);
		});

		it("should return undefined for masked when no key exists", async () => {
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { getMasked } = useOpenRouterKey();

			expect(getMasked()).toBeUndefined();
		});

		it("should return undefined for masked when key is too short", async () => {
			mockStorageValue.value.openRouterApiKey = "abc";
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { getMasked } = useOpenRouterKey();

			expect(getMasked()).toBeUndefined();
		});

		it("should report canUseAiChat true when online and key present", async () => {
			mockStorageValue.value.openRouterApiKey = "sk-or-v1-test123456789";
			mockOnlineValue.value = true;
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { canUseAiChat } = useOpenRouterKey();

			expect(canUseAiChat.value).toBe(true);
		});

		it("should report canUseAiChat false when offline", async () => {
			mockStorageValue.value.openRouterApiKey = "sk-or-v1-test123456789";
			mockOnlineValue.value = false;
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { canUseAiChat } = useOpenRouterKey();

			expect(canUseAiChat.value).toBe(false);
		});

		it("should report canUseAiChat false when no key", async () => {
			mockOnlineValue.value = true;
			const { useOpenRouterKey } = await import("~/composables/openRouterKey");
			const { canUseAiChat } = useOpenRouterKey();

			expect(canUseAiChat.value).toBe(false);
		});
	});
});
