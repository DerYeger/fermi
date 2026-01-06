import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import BooleanFilter from "~/components/Table/BooleanFilter.vue";

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
let localStorageRef = ref(false);

// Mock useLocalStorage and useEventBus
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	const { ref: vueRef } = await import("vue");
	return {
		...actual,
		useLocalStorage: (_key: unknown, defaultValue: boolean) => {
			localStorageRef = vueRef(defaultValue);
			return localStorageRef;
		},
		useEventBus: () => ({
			on: mockEventBusOn
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

	describe("rendering", () => {
		it("renders filter button with correct icon", async () => {
			const wrapper = await mountSuspended(BooleanFilter, {
				props: defaultProps
			});
			expect(wrapper.find("button").exists()).toBe(true);
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("icon")).toBe("hugeicons:filter");
		});

		it("renders UPopover component", async () => {
			const wrapper = await mountSuspended(BooleanFilter, {
				props: defaultProps
			});
			expect(wrapper.findComponent({ name: "UPopover" }).exists()).toBe(true);
		});

		it("uses link variant for button", async () => {
			const wrapper = await mountSuspended(BooleanFilter, {
				props: defaultProps
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("variant")).toBe("link");
		});
	});

	describe("filter states", () => {
		it("uses neutral color when not filtered and popover closed", async () => {
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

	describe("event bus", () => {
		it("registers event bus listener on mount", async () => {
			await mountSuspended(BooleanFilter, {
				props: defaultProps
			});
			expect(mockEventBusOn).toHaveBeenCalled();
		});
	});

	describe("onUpdate callback", () => {
		it("calls onUpdate on mount with initial value", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(BooleanFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith(false);
		});

		it("calls onUpdate with false when unmounted", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(BooleanFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			wrapper.unmount();
			expect(mockOnUpdate).toHaveBeenCalledWith(false);
		});

		it("calls onUpdate when model value changes", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(BooleanFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			localStorageRef.value = true;
			await nextTick();
			expect(mockOnUpdate).toHaveBeenCalledWith(true);
		});
	});

	describe("event bus clear handler", () => {
		it("resets model to false when clear event is received", async () => {
			const mockOnUpdate = vi.fn();
			localStorageRef.value = true;
			await mountSuspended(BooleanFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			const callback = eventBusCallback();
			expect(callback).toBeDefined();
			callback!("clear");
			expect(localStorageRef.value).toBe(false);
		});
	});
});
