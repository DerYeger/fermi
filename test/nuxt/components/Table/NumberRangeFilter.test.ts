import type { NumberRangeFilterState } from "~/types/filter";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import NumberRangeFilter from "~/components/Table/NumberRangeFilter.vue";

const { mockEventBusOn, eventBusCallback } = vi.hoisted(() => {
	let callback: ((type: string) => void) | null = null;
	return {
		mockEventBusOn: vi.fn((cb: (type: string) => void) => {
			callback = cb;
		}),
		eventBusCallback: () => callback
	};
});

// Shared ref that will be created in the mock
let localStorageRef = ref<NumberRangeFilterState>({ min: 0, max: 100 });

// Mock useLocalStorage and useEventBus
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	const { ref: vueRef } = await import("vue");
	return {
		...actual,
		useLocalStorage: (_key: unknown, defaultValue: NumberRangeFilterState) => {
			localStorageRef = vueRef(defaultValue);
			return localStorageRef;
		},
		useEventBus: () => ({
			on: mockEventBusOn
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

	describe("rendering", () => {
		it("renders filter button with correct icon", async () => {
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: defaultProps
			});
			expect(wrapper.find("button").exists()).toBe(true);
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("icon")).toBe("hugeicons:filter");
		});

		it("renders UPopover component", async () => {
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: defaultProps
			});
			expect(wrapper.findComponent({ name: "UPopover" }).exists()).toBe(true);
		});

		it("uses link variant for filter button", async () => {
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: defaultProps
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("variant")).toBe("link");
		});
	});

	describe("filter states", () => {
		it("uses neutral color when not filtered and popover closed", async () => {
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
	});

	describe("onUpdate callback", () => {
		it("calls onUpdate on mount with default min/max", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ min: 0, max: 100 });
		});

		it("calls onUpdate with custom min/max props", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, min: 10, max: 50, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ min: 10, max: 50 });
		});
	});

	describe("event bus", () => {
		it("registers event bus listener on mount", async () => {
			await mountSuspended(NumberRangeFilter, {
				props: defaultProps
			});
			expect(mockEventBusOn).toHaveBeenCalled();
		});

		it("resets to min/max when clear event is received", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			// Simulate changing the filter
			localStorageRef.value = { min: 20, max: 80 };
			await nextTick();
			mockOnUpdate.mockClear();
			const callback = eventBusCallback();
			callback!("clear");
			await nextTick();
			expect(mockOnUpdate).toHaveBeenCalledWith({ min: 0, max: 100 });
		});
	});

	describe("onBeforeUnmount", () => {
		it("calls onUpdate with default min/max when unmounted", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			wrapper.unmount();
			expect(mockOnUpdate).toHaveBeenCalledWith({ min: 0, max: 100 });
		});
	});

	describe("min/max prop changes", () => {
		it("adjusts model min when prop min increases beyond current value", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, min: 0, max: 100, onUpdate: mockOnUpdate }
			});
			// Simulate having a value below the new min
			localStorageRef.value = { min: 5, max: 95 };
			await nextTick();
			mockOnUpdate.mockClear();
			await wrapper.setProps({ min: 20, max: 100 });
			await nextTick();
			expect(localStorageRef.value.min).toBeGreaterThanOrEqual(20);
		});

		it("adjusts model max when prop max decreases below current value", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(NumberRangeFilter, {
				props: { ...defaultProps, min: 0, max: 100, onUpdate: mockOnUpdate }
			});
			// Simulate having a value above the new max
			localStorageRef.value = { min: 5, max: 95 };
			await nextTick();
			mockOnUpdate.mockClear();
			await wrapper.setProps({ min: 0, max: 80 });
			await nextTick();
			expect(localStorageRef.value.max).toBeLessThanOrEqual(80);
		});
	});
});
