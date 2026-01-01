import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DateFilter from "~/components/Table/DateFilter.vue";

// Mock useLocalStorage
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLocalStorage: () => ref(null),
		useEventBus: () => ({
			on: vi.fn()
		})
	};
});

// Mock InputDatePicker
vi.mock("~/components/InputDatePicker.vue", () => ({
	default: {
		name: "InputDatePicker",
		template: "<div>DatePicker</div>"
	}
}));

describe("components/Table/DateFilter", () => {
	const defaultProps = {
		type: "date" as const,
		id: "test-date-filter",
		isFiltered: false,
		onUpdate: vi.fn()
	};

	it("renders filter button", async () => {
		const wrapper = await mountSuspended(DateFilter, {
			props: defaultProps
		});
		expect(wrapper.find("button").exists()).toBe(true);
	});

	it("renders filter icon", async () => {
		const wrapper = await mountSuspended(DateFilter, {
			props: defaultProps
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:filter");
	});

	it("uses neutral color when not filtered and closed", async () => {
		const wrapper = await mountSuspended(DateFilter, {
			props: { ...defaultProps, isFiltered: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("neutral");
	});

	it("uses primary color when filtered", async () => {
		const wrapper = await mountSuspended(DateFilter, {
			props: { ...defaultProps, isFiltered: true }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("primary");
	});
});
