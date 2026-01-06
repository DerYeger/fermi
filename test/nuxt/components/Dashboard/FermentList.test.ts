import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FermentList from "~/components/Dashboard/FermentList.vue";
import { ACTIVE_FERMENT_WITH_DATA, BASE_ACTIVE_FERMENT } from "../../../data";

describe("components/Dashboard/FermentList", () => {
	const defaultProps = {
		title: "Ferments",
		icon: "hugeicons:jar",
		noItemsText: "No ferments",
		isLoading: false,
		items: [] as typeof BASE_ACTIVE_FERMENT[]
	};

	describe("rendering", () => {
		it("renders DashboardList component", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: defaultProps
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.exists()).toBe(true);
		});
	});

	describe("props passthrough to DashboardList", () => {
		it("passes title prop to DashboardList", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, title: "Custom Title" }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("title")).toBe("Custom Title");
		});

		it("passes icon prop to DashboardList", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, icon: "hugeicons:custom-icon" }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("icon")).toBe("hugeicons:custom-icon");
		});

		it("passes noItemsText prop to DashboardList", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, noItemsText: "Nothing here" }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("noItemsText")).toBe("Nothing here");
		});

		it("passes isLoading prop to DashboardList when false", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, isLoading: false }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("isLoading")).toBe(false);
		});

		it("passes isLoading prop to DashboardList when true", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, isLoading: true }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("isLoading")).toBe(true);
		});
	});

	describe("items handling", () => {
		it("passes empty items array to DashboardList", async () => {
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, items: [] }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("items")).toEqual([]);
		});

		it("passes single item to DashboardList", async () => {
			const items = [BASE_ACTIVE_FERMENT];
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, items }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("items")).toEqual(items);
		});

		it("passes multiple items to DashboardList", async () => {
			const items = [BASE_ACTIVE_FERMENT, ACTIVE_FERMENT_WITH_DATA];
			const wrapper = await mountSuspended(FermentList, {
				shallow: true,
				props: { ...defaultProps, items }
			});
			const dashboardList = wrapper.findComponent({ name: "DashboardList" });
			expect(dashboardList.props("items")).toHaveLength(2);
		});
	});

	describe("item rendering", () => {
		it("renders UButton for each ferment item", async () => {
			const items = [BASE_ACTIVE_FERMENT, ACTIVE_FERMENT_WITH_DATA];
			const wrapper = await mountSuspended(FermentList, {
				props: { ...defaultProps, items }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			expect(buttons).toHaveLength(2);
		});

		it("uButton has correct link props", async () => {
			const items = [BASE_ACTIVE_FERMENT];
			const wrapper = await mountSuspended(FermentList, {
				props: { ...defaultProps, items }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("neutral");
			expect(button.props("icon")).toBe("hugeicons:arrow-right-02");
			expect(button.props("variant")).toBe("link");
			expect(button.props("to")).toBe(`/ferments/${BASE_ACTIVE_FERMENT.id}`);
		});

		it("displays ferment name in button", async () => {
			const items = [ACTIVE_FERMENT_WITH_DATA];
			const wrapper = await mountSuspended(FermentList, {
				props: { ...defaultProps, items }
			});
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.name);
		});
	});
});
