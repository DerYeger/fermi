import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FavoritesList from "~/components/Dashboard/FavoritesList.vue";
import { BASE_COMPLETED_FERMENT, FAVORITE_ACTIVE_FERMENT } from "../../../data";

const favoriteCompleted = { ...BASE_COMPLETED_FERMENT, isFavorite: true, id: "fav-completed" };

// Mock @tanstack/vue-db with all required exports
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		eq: vi.fn(),
		useLiveQuery: () => ({
			data: ref([FAVORITE_ACTIVE_FERMENT, favoriteCompleted]),
			isLoading: ref(false)
		}),
		createCollection: vi.fn(() => ({}))
	};
});

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {}
	};
});

describe("components/Dashboard/FavoritesList", () => {
	describe("rendering", () => {
		it("renders FermentList component", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.exists()).toBe(true);
		});

		it("passes correct title prop to FermentList", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("title")).toBe("Favorites");
		});

		it("passes correct icon prop to FermentList", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("icon")).toBe("hugeicons:favourite");
		});

		it("passes correct noItemsText prop to FermentList", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("noItemsText")).toBe("No favorites");
		});

		it("passes isLoading from query to FermentList", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("isLoading")).toBe(false);
		});

		it("passes data from query as items to FermentList", async () => {
			const wrapper = await mountSuspended(FavoritesList, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("items")).toHaveLength(2);
		});
	});

	describe("slot content", () => {
		it("renders UBadge for completed ferments", async () => {
			const wrapper = await mountSuspended(FavoritesList);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			// Only completed ferments get a badge
			expect(badges.length).toBeGreaterThan(0);
		});

		it("uBadge for completed has subtle variant", async () => {
			const wrapper = await mountSuspended(FavoritesList);
			const badge = wrapper.findComponent({ name: "UBadge" });
			expect(badge.props("variant")).toBe("subtle");
		});

		it("uBadge shows 'Completed' text for completed ferments", async () => {
			const wrapper = await mountSuspended(FavoritesList);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const completedBadge = badges.find((b) => b.text().includes("Completed"));
			expect(completedBadge).toBeDefined();
		});
	});
});
