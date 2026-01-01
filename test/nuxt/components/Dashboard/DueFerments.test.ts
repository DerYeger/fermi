import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DueFerments from "~/components/Dashboard/DueFerments.vue";

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

// Mock useDueFerments
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useDueFerments: () => ({
			data: ref([]),
			isLoading: ref(false)
		}),
		today: ref("2024-01-15"),
		formatTimeSince: () => "3 days"
	};
});

describe("components/Dashboard/DueFerments", () => {
	it("renders FermentList with correct title prop", async () => {
		const wrapper = await mountSuspended(DueFerments);
		const fermentList = wrapper.findComponent({ name: "FermentList" });
		expect(fermentList.exists()).toBe(true);
		expect(fermentList.props("title")).toBe("Today");
	});
});
