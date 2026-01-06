import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import DashboardList from "~/components/Dashboard/DashboardList.vue";

describe("components/Dashboard/DashboardList", () => {
	const defaultProps = {
		title: "Recent Items",
		icon: "hugeicons:list",
		noItemsText: "No items found",
		isLoading: false,
		items: []
	};

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: defaultProps
		});
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Recent Items");
		expect(header.props("icon")).toBe("hugeicons:list");
	});

	it("shows Loader when isLoading is true", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: { ...defaultProps, isLoading: true }
		});
		const loader = wrapper.findComponent({ name: "Loader" });
		expect(loader.exists()).toBe(true);
	});

	it("shows no items text when items array is empty", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: defaultProps
		});
		expect(wrapper.text()).toContain("No items found");
	});

	it("does not show no items text when items are provided", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: {
				...defaultProps,
				items: [{ id: "1", name: "Item 1" }, { id: "2", name: "Item 2" }] as const
			},
			slots: {
				default: ({ item }) => h((item as { name: string }).name)
			}
		});
		expect(wrapper.text()).not.toContain("No items found");
	});
});
