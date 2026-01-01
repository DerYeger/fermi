import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import RatingsChart from "~/components/Dashboard/RatingsChart.vue";

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
	useCompletedFerments: () => ({
		data: { value: [
			{ state: "completed", overall: { stars: 4 }, flavor: { stars: 4 }, texture: { stars: 4 }, smell: { stars: 4 }, process: { stars: 4 } }
		] },
		isLoading: { value: false }
	})
}));

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useCssVar: () => ({ value: "#000000" }),
		useColorMode: () => ({ value: "light" })
	};
});

vi.mock("~/types/ferment", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual
	};
});

describe("components/Dashboard/RatingsChart", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(RatingsChart);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(RatingsChart);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Ratings");
		expect(header.props("icon")).toBe("hugeicons:chart-radar");
	});

	it("renders VChart component when data exists", async () => {
		const wrapper = await mountSuspended(RatingsChart);
		// The mock has class="v-chart-mock"
		const chart = wrapper.find(".v-chart-mock");
		expect(chart.exists()).toBe(true);
	});
});
