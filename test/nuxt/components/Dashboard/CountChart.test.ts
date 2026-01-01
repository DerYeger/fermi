import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import CountChart from "~/components/Dashboard/CountChart.vue";

// Mock vue-echarts
vi.mock("vue-echarts", () => ({
	default: {
		name: "VChart",
		template: "<div class=\"v-chart-mock\"></div>",
		props: ["option", "autoresize"]
	}
}));

// Mock composables
vi.mock("~/composables/ferments", () => ({
	useFerments: () => ({
		data: { value: [
			{ state: "active", startDate: "2024-01-01", endDate: null },
			{ state: "completed", startDate: "2024-01-01", endDate: "2024-01-10" }
		] },
		isLoading: { value: false }
	})
}));

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		today: { value: "2024-01-15" },
		getISODate: (date: Date) => date.toISOString().split("T")[0],
		useCssVar: () => ({ value: "#000000" }),
		useColorMode: () => ({ value: "light" })
	};
});

describe("components/Dashboard/CountChart", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(CountChart);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(CountChart);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("History");
		expect(header.props("icon")).toBe("hugeicons:chart-line-data-01");
	});

	it("renders VChart component when data exists", async () => {
		const wrapper = await mountSuspended(CountChart);
		// The mock has class="v-chart-mock"
		const chart = wrapper.find(".v-chart-mock");
		expect(chart.exists()).toBe(true);
	});
});
