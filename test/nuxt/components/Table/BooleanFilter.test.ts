import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import BooleanFilter from "~/components/Table/BooleanFilter.vue";

// Mock useLocalStorage
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLocalStorage: () => ref(false),
		useEventBus: () => ({
			on: vi.fn()
		})
	};
});

describe("components/Table/BooleanFilter", () => {
	const defaultProps = {
		type: "boolean" as const,
		id: "test-filter",
		label: "Show Only Active",
		isFiltered: false,
		onUpdate: vi.fn()
	};

	it("renders filter button", async () => {
		const wrapper = await mountSuspended(BooleanFilter, {
			props: defaultProps
		});
		expect(wrapper.find("button").exists()).toBe(true);
	});

	it("renders filter icon", async () => {
		const wrapper = await mountSuspended(BooleanFilter, {
			props: defaultProps
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:filter");
	});

	it("uses neutral color when not filtered and closed", async () => {
		const wrapper = await mountSuspended(BooleanFilter, {
			props: { ...defaultProps, isFiltered: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("neutral");
	});

	it("uses primary color when filtered", async () => {
		const wrapper = await mountSuspended(BooleanFilter, {
			props: { ...defaultProps, isFiltered: true }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("primary");
	});
});
