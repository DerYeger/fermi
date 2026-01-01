import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FavoritesList from "~/components/Dashboard/FavoritesList.vue";

// Mock FermentList
vi.mock("~/components/Dashboard/FermentList.vue", () => ({
	default: {
		name: "FermentList",
		props: ["title", "icon", "noItemsText", "isLoading", "items"],
		template: `<div>
			<span>{{ title }}</span>
			<span v-if="isLoading">Loading</span>
			<span v-else-if="items?.length === 0">{{ noItemsText }}</span>
			<div v-else v-for="item in items" :key="item.id">{{ item.name }}</div>
		</div>`
	}
}));

// Mock @tanstack/vue-db with all required exports
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		eq: vi.fn(),
		useLiveQuery: () => ({
			data: ref([]),
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
	it("renders FermentList with correct title prop", async () => {
		const wrapper = await mountSuspended(FavoritesList);
		const fermentList = wrapper.findComponent({ name: "FermentList" });
		expect(fermentList.exists()).toBe(true);
		expect(fermentList.props("title")).toBe("Favorites");
	});
});
