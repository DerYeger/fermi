import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import FavoriteFermentButton from "~/components/FavoriteFermentButton.vue";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT, FAVORITE_ACTIVE_FERMENT } from "../../data";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockUpdate } = vi.hoisted(() => ({
	mockUpdate: vi.fn()
}));

// Mock FermentCollection from composables
vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		update: mockUpdate
	}
}));

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		getISODatetime: () => "2024-01-15T12:00:00Z"
	};
});

describe("components/FavoriteFermentButton", () => {
	describe("rendering", () => {
		it("renders UButton with ghost variant and sm size", async () => {
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.exists()).toBe(true);
			expect(button.props("variant")).toBe("ghost");
			expect(button.props("size")).toBe("sm");
			expect(button.props("icon")).toBe("hugeicons:favourite");
		});

		it("uses neutral color when not favorited", async () => {
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("neutral");
		});

		it("uses error color when favorited", async () => {
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: FAVORITE_ACTIVE_FERMENT }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("error");
		});
	});

	describe("ferment types", () => {
		it("works with active ferment", async () => {
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			expect(wrapper.find("button").exists()).toBe(true);
		});

		it("works with completed ferment", async () => {
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			expect(wrapper.find("button").exists()).toBe(true);
		});
	});

	describe("interactions", () => {
		it("calls FermentCollection.update when clicked to favorite", async () => {
			mockUpdate.mockClear();
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			await wrapper.find("button").trigger("click");
			await flushPromises();
			expect(mockUpdate).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT.id, expect.any(Function));
		});

		it("calls FermentCollection.update when clicked to unfavorite", async () => {
			mockUpdate.mockClear();
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: FAVORITE_ACTIVE_FERMENT }
			});
			await wrapper.find("button").trigger("click");
			await flushPromises();
			expect(mockUpdate).toHaveBeenCalledWith(FAVORITE_ACTIVE_FERMENT.id, expect.any(Function));
		});

		it("update callback toggles isFavorite and sets updatedAt", async () => {
			mockUpdate.mockClear();
			const wrapper = await mountSuspended(FavoriteFermentButton, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			await wrapper.find("button").trigger("click");
			await flushPromises();
			const [, updater] = mockUpdate.mock.calls[0] as [string, (draft: { isFavorite: boolean, updatedAt: string }) => void];
			const draft = { isFavorite: false, updatedAt: "" };
			updater(draft);
			expect(draft.isFavorite).toBe(true);
			// Verify updatedAt is set to a valid ISO datetime string
			expect(draft.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		});
	});
});
