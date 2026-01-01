import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ContainerChart from "~/components/Dashboard/ContainerChart.vue";

// Mock vue-echarts
vi.mock("vue-echarts", () => ({
	default: {
		name: "VChart",
		template: "<div class=\"v-chart-mock\"></div>",
		props: ["option", "autoresize"]
	}
}));

// Mock composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useCssVar: () => ({ value: "#000000" }),
		useColorMode: () => ({ value: "light" }),
		useChartShadows: () => ({})
	};
});

// Mock @tanstack/vue-db
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLiveQuery: () => ({
			data: { value: [{ container: "Jar" }, { container: "Crock" }] },
			isLoading: { value: false }
		})
	};
});

vi.mock("~/types/utils", () => ({
	limitLength: (str: string, len: number) => str.length > len ? `${str.substring(0, len)}...` : str
}));

describe("components/Dashboard/ContainerChart", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(ContainerChart);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(ContainerChart);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Containers");
		expect(header.props("icon")).toBe("hugeicons:chart-rose");
	});

	it("renders VChart component when data exists", async () => {
		const wrapper = await mountSuspended(ContainerChart);
		// The mock has class="v-chart-mock"
		const chart = wrapper.find(".v-chart-mock");
		expect(chart.exists()).toBe(true);
	});
});
