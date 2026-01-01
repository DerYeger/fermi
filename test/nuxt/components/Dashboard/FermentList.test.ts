import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FermentList from "~/components/Dashboard/FermentList.vue";

// Mock DashboardList
vi.mock("~/components/Dashboard/DashboardList.vue", () => ({
	default: {
		name: "DashboardList",
		props: ["title", "icon", "noItemsText", "isLoading", "items"],
		template: "<div data-testid=\"dashboard-list\"></div>"
	}
}));

describe("components/Dashboard/FermentList", () => {
	const defaultProps = {
		title: "Ferments",
		icon: "hugeicons:jar",
		noItemsText: "No ferments",
		isLoading: false,
		items: []
	};

	it("renders DashboardList component", async () => {
		const wrapper = await mountSuspended(FermentList, {
			props: defaultProps
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.exists()).toBe(true);
	});

	it("passes title prop to DashboardList", async () => {
		const wrapper = await mountSuspended(FermentList, {
			props: defaultProps
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.props("title")).toBe("Ferments");
	});

	it("passes icon prop to DashboardList", async () => {
		const wrapper = await mountSuspended(FermentList, {
			props: defaultProps
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.props("icon")).toBe("hugeicons:jar");
	});

	it("passes noItemsText prop to DashboardList", async () => {
		const wrapper = await mountSuspended(FermentList, {
			props: defaultProps
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.props("noItemsText")).toBe("No ferments");
	});

	it("passes isLoading prop to DashboardList", async () => {
		const wrapper = await mountSuspended(FermentList, {
			props: { ...defaultProps, isLoading: true }
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.props("isLoading")).toBe(true);
	});

	it("passes items prop to DashboardList", async () => {
		const items = [
			{
				version: 1 as const,
				id: "1",
				name: "Kimchi",
				state: "active" as const,
				startDate: "2024-01-01",
				endDate: null,
				saltRatio: 0.02,
				container: null,
				ingredients: [],
				images: [],
				isFavorite: false,
				notes: "",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			},
			{
				version: 1 as const,
				id: "2",
				name: "Sauerkraut",
				state: "active" as const,
				startDate: "2024-01-01",
				endDate: null,
				saltRatio: 0.02,
				container: null,
				ingredients: [],
				images: [],
				isFavorite: false,
				notes: "",
				createdAt: "2024-01-01T00:00:00Z",
				updatedAt: "2024-01-01T00:00:00Z"
			}
		];
		const wrapper = await mountSuspended(FermentList, {
			props: { ...defaultProps, items }
		});
		const dashboardList = wrapper.findComponent({ name: "DashboardList" });
		expect(dashboardList.props("items")).toEqual(items);
	});
});
