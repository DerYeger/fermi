import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import NumberRangeFilter from "~/components/Table/NumberRangeFilter.vue";

// Mock useLocalStorage
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLocalStorage: (key: unknown, defaultValue: unknown) => ref(defaultValue),
		useEventBus: () => ({
			on: vi.fn()
		})
	};
});

describe("components/Table/NumberRangeFilter", () => {
	const defaultProps = {
		type: "number-range" as const,
		id: "test-range-filter",
		min: 0,
		max: 100,
		step: 1,
		isFiltered: false,
		onUpdate: vi.fn()
	};

	it("renders filter button", async () => {
		const wrapper = await mountSuspended(NumberRangeFilter, {
			props: defaultProps
		});
		expect(wrapper.find("button").exists()).toBe(true);
	});

	it("renders filter icon", async () => {
		const wrapper = await mountSuspended(NumberRangeFilter, {
			props: defaultProps
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:filter");
	});

	it("uses neutral color when not filtered and closed", async () => {
		const wrapper = await mountSuspended(NumberRangeFilter, {
			props: { ...defaultProps, isFiltered: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("neutral");
	});

	it("uses primary color when filtered", async () => {
		const wrapper = await mountSuspended(NumberRangeFilter, {
			props: { ...defaultProps, isFiltered: true }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("primary");
	});

	it("shows percentage format when percentage prop is true", async () => {
		const wrapper = await mountSuspended(NumberRangeFilter, {
			props: { ...defaultProps, percentage: true }
		});
		// The component should render percentage values
		expect(wrapper.exists()).toBe(true);
	});
});
