import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import IngredientsChart from "~/components/Dashboard/IngredientsChart.vue";

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
	useIngredients: () => ({
		data: { value: [{ ingredients: [{ name: "Cabbage" }] }] },
		isLoading: { value: false }
	})
}));

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useCssVar: () => ({ value: "#000000" }),
		useColorMode: () => ({ value: "light" }),
		useChartShadows: () => ({ value: {} }),
		createVisualMap: () => ({})
	};
});

vi.mock("~/types/utils", () => ({
	limitLength: (str: string, len: number) => str.length > len ? `${str.substring(0, len)}...` : str
}));

describe("components/Dashboard/IngredientsChart", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(IngredientsChart);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(IngredientsChart);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Ingredients");
		expect(header.props("icon")).toBe("hugeicons:pie-chart");
	});

	it("renders VChart component when data exists", async () => {
		const wrapper = await mountSuspended(IngredientsChart);
		// The mock has class="v-chart-mock"
		const chart = wrapper.find(".v-chart-mock");
		expect(chart.exists()).toBe(true);
	});
});
