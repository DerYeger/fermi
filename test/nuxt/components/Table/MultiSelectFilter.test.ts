import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import MultiSelectFilter from "~/components/Table/MultiSelectFilter.vue";

// Mock useLocalStorage
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLocalStorage: () => ref([]),
		useEventBus: () => ({
			on: vi.fn()
		})
	};
});

describe("components/Table/MultiSelectFilter", () => {
	const defaultProps = {
		type: "multi-select" as const,
		id: "test-multi-filter",
		items: ["Option A", "Option B", "Option C"],
		isFiltered: false,
		onUpdate: vi.fn()
	};

	it("renders the component", async () => {
		const wrapper = await mountSuspended(MultiSelectFilter, {
			props: defaultProps
		});
		expect(wrapper.exists()).toBe(true);
	});

	it("renders filter icon", async () => {
		const wrapper = await mountSuspended(MultiSelectFilter, {
			props: defaultProps
		});
		const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
		expect(selectMenu.props("trailingIcon")).toBe("hugeicons:filter");
	});

	it("uses link variant", async () => {
		const wrapper = await mountSuspended(MultiSelectFilter, {
			props: { ...defaultProps, isFiltered: false }
		});
		const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
		expect(selectMenu.props("variant")).toBe("none");
	});

	it("is configured for multiple selection", async () => {
		const wrapper = await mountSuspended(MultiSelectFilter, {
			props: { ...defaultProps, isFiltered: true }
		});
		const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
		expect(selectMenu.props("multiple")).toBe(true);
	});
});
