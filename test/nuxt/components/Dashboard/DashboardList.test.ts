import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { h } from "vue";
import DashboardList from "~/components/Dashboard/DashboardList.vue";
import { BASE_ACTIVE_FERMENT } from "../../../data";

describe("components/Dashboard/DashboardList", () => {
	const DEFAULT_PROPS = {
		title: "Recent Items",
		icon: "hugeicons:list",
		noItemsText: "No items found",
		isLoading: false,
		items: [] as unknown[]
	};

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: DEFAULT_PROPS
		});
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe(DEFAULT_PROPS.title);
		expect(header.props("icon")).toBe(DEFAULT_PROPS.icon);
	});

	it("shows Loader when isLoading is true", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: { ...DEFAULT_PROPS, isLoading: true }
		});
		const loader = wrapper.findComponent({ name: "Loader" });
		expect(loader.exists()).toBe(true);
	});

	it("shows no items text when items array is empty", async () => {
		const wrapper = await mountSuspended(DashboardList, {
			props: DEFAULT_PROPS
		});
		expect(wrapper.text()).toContain(DEFAULT_PROPS.noItemsText);
	});

	it("renders items when provided and does not show no items text", async () => {
		const items = [BASE_ACTIVE_FERMENT, { ...BASE_ACTIVE_FERMENT, id: "test-2", name: "Second Ferment" }];
		const wrapper = await mountSuspended(DashboardList, {
			props: {
				...DEFAULT_PROPS,
				items
			},
			slots: {
				default: ({ item }) => h("div", (item as { name: string }).name)
			}
		});
		expect(wrapper.text()).not.toContain(DEFAULT_PROPS.noItemsText);
		expect(wrapper.text()).toContain(items[0]!.name);
		expect(wrapper.text()).toContain(items[1]!.name);
	});
});
