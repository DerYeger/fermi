import type { DateFilterState } from "~/types/filter";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import DateFilter from "~/components/Table/DateFilter.vue";

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
let localStorageRef = ref<DateFilterState>(null);

// Initial value to set before component mounts
let initialLocalStorageValue: DateFilterState = null;

// Mock useLocalStorage and useEventBus
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	const { ref: vueRef } = await import("vue");
	return {
		...actual,
		useLocalStorage: (_key: unknown, _defaultValue: DateFilterState) => {
			localStorageRef = vueRef(initialLocalStorageValue);
			return localStorageRef;
		},
		useEventBus: () => ({
			on: mockEventBusOn
		})
	};
});

describe("components/Table/DateFilter", () => {
	const defaultProps = {
		type: "date" as const,
		id: "test-date-filter",
		isFiltered: false,
		onUpdate: vi.fn()
	};

	// Reset initial localStorage value before each test
	beforeEach(() => {
		initialLocalStorageValue = null;
	});

	describe("rendering", () => {
		it("renders filter button with correct icon", async () => {
			const wrapper = await mountSuspended(DateFilter, {
				props: defaultProps
			});
			expect(wrapper.find("button").exists()).toBe(true);
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("icon")).toBe("hugeicons:filter");
		});

		it("renders UPopover component", async () => {
			const wrapper = await mountSuspended(DateFilter, {
				props: defaultProps
			});
			expect(wrapper.findComponent({ name: "UPopover" }).exists()).toBe(true);
		});

		it("uses link variant for button", async () => {
			const wrapper = await mountSuspended(DateFilter, {
				props: defaultProps
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("variant")).toBe("link");
		});
	});

	describe("filter states", () => {
		it("uses neutral color when not filtered and popover closed", async () => {
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

	describe("event bus", () => {
		it("registers event bus listener on mount", async () => {
			await mountSuspended(DateFilter, {
				props: defaultProps
			});
			expect(mockEventBusOn).toHaveBeenCalled();
		});
	});

	describe("onUpdate callback", () => {
		it("calls onUpdate with null on mount when no filter set", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith(null);
		});

		it("calls onUpdate with null when unmounted", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			wrapper.unmount();
			expect(mockOnUpdate).toHaveBeenCalledWith(null);
		});
	});

	describe("initializing from localStorage", () => {
		it("initializes with on type from localStorage", async () => {
			initialLocalStorageValue = { type: "on", date: "2024-06-15" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "on", date: "2024-06-15" });
		});

		it("initializes with before type from localStorage", async () => {
			initialLocalStorageValue = { type: "before", date: "2024-03-20" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "before", date: "2024-03-20" });
		});

		it("initializes with after type from localStorage", async () => {
			initialLocalStorageValue = { type: "after", date: "2024-09-01" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "after", date: "2024-09-01" });
		});

		it("initializes with between type from localStorage", async () => {
			initialLocalStorageValue = { type: "between", from: "2024-01-01", to: "2024-12-31" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "between", from: "2024-01-01", to: "2024-12-31" });
		});
	});

	describe("filter model updates via localStorage changes", () => {
		it("calls onUpdate when model changes to a date filter", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			localStorageRef.value = { type: "on", date: "2024-05-15" };
			await nextTick();

			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "on", date: "2024-05-15" });
		});

		it("calls onUpdate when model changes to between filter", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			localStorageRef.value = { type: "between", from: "2024-01-01", to: "2024-06-30" };
			await nextTick();

			expect(mockOnUpdate).toHaveBeenCalledWith({ type: "between", from: "2024-01-01", to: "2024-06-30" });
		});

		it("calls onUpdate with null when model is cleared", async () => {
			initialLocalStorageValue = { type: "on", date: "2024-05-15" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			localStorageRef.value = null;
			await nextTick();

			expect(mockOnUpdate).toHaveBeenCalledWith(null);
		});

		it("does not call onUpdate when model value is identical", async () => {
			initialLocalStorageValue = { type: "on", date: "2024-05-15" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			// Set to the same value
			localStorageRef.value = { type: "on", date: "2024-05-15" };
			await nextTick();

			expect(mockOnUpdate).not.toHaveBeenCalled();
		});
	});

	describe("reset functionality", () => {
		it("resets filter when clear event is received", async () => {
			initialLocalStorageValue = { type: "on", date: "2024-06-15" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			const callback = eventBusCallback();
			callback?.("clear");
			await nextTick();

			expect(mockOnUpdate).toHaveBeenCalledWith(null);
		});

		it("ignores non-clear events from event bus", async () => {
			initialLocalStorageValue = { type: "on", date: "2024-06-15" };
			const mockOnUpdate = vi.fn();
			await mountSuspended(DateFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();

			const callback = eventBusCallback();
			callback?.("other-event");
			await nextTick();

			expect(mockOnUpdate).not.toHaveBeenCalled();
		});
	});
});
