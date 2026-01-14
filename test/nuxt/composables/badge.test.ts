import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

// Mock setBadgeCount function
const mockSetBadgeCount = vi.fn();

// Create reactive refs for mock data
const mockDueFermentsData = ref<unknown[]>([]);
const mockOverdueFermentsData = ref<unknown[]>([]);

// Mock the Tauri webviewWindow module before any imports
vi.mock("@tauri-apps/api/webviewWindow", () => ({
	getCurrentWebviewWindow: () => ({
		setBadgeCount: mockSetBadgeCount
	})
}));

mockNuxtImport("useDueFerments", () => {
	return () => ({
		data: mockDueFermentsData,
		isLoading: ref(false)
	});
});

mockNuxtImport("useOverdueFerments", () => {
	return () => ({
		data: mockOverdueFermentsData,
		isLoading: ref(false)
	});
});

describe("composables/badge", () => {
	afterEach(() => {
		mockDueFermentsData.value = [];
		mockOverdueFermentsData.value = [];
	});

	describe("useBadgeCount", () => {
		it("should set badge count to undefined when no due or overdue ferments", async () => {
			const { useBadgeCount } = await import("~/composables/badge");
			useBadgeCount();

			// Wait for watchEffect to execute
			await nextTick();

			expect(mockSetBadgeCount).toHaveBeenCalledWith(undefined);
		});

		it("should set badge count when there are due ferments", async () => {
			mockDueFermentsData.value = [{ id: "1" }, { id: "2" }];

			const { useBadgeCount } = await import("~/composables/badge");
			useBadgeCount();

			await nextTick();

			expect(mockSetBadgeCount).toHaveBeenCalledWith(2);
		});

		it("should set badge count when there are overdue ferments", async () => {
			mockOverdueFermentsData.value = [{ id: "1" }, { id: "2" }, { id: "3" }];

			const { useBadgeCount } = await import("~/composables/badge");
			useBadgeCount();

			await nextTick();

			expect(mockSetBadgeCount).toHaveBeenCalledWith(3);
		});

		it("should set badge count to combined total of due and overdue ferments", async () => {
			mockDueFermentsData.value = [{ id: "1" }, { id: "2" }];
			mockOverdueFermentsData.value = [{ id: "3" }, { id: "4" }, { id: "5" }];

			const { useBadgeCount } = await import("~/composables/badge");
			useBadgeCount();

			await nextTick();

			expect(mockSetBadgeCount).toHaveBeenCalledWith(5);
		});

		it("should handle null data values gracefully", async () => {
			mockDueFermentsData.value = null as unknown as unknown[];
			mockOverdueFermentsData.value = null as unknown as unknown[];

			const { useBadgeCount } = await import("~/composables/badge");
			useBadgeCount();

			await nextTick();

			expect(mockSetBadgeCount).toHaveBeenCalledWith(undefined);
		});
	});
});
