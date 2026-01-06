import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { nextTick, ref } from "vue";
import MultiSelectFilter from "~/components/Table/MultiSelectFilter.vue";

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
let localStorageRef = ref<string[]>([]);

// Mock useLocalStorage and useEventBus
vi.mock("@vueuse/core", async (importOriginal) => {
	const actual = await importOriginal<object>();
	const { ref: vueRef } = await import("vue");
	return {
		...actual,
		useLocalStorage: (_key: unknown, defaultValue: string[]) => {
			localStorageRef = vueRef(defaultValue);
			return localStorageRef;
		},
		useEventBus: () => ({
			on: mockEventBusOn
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

	describe("rendering", () => {
		it("renders USelectMenu component", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: defaultProps
			});
			expect(wrapper.findComponent({ name: "USelectMenu" }).exists()).toBe(true);
		});

		it("renders filter icon as trailing icon", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: defaultProps
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.props("trailingIcon")).toBe("hugeicons:filter");
		});

		it("uses none variant for select menu", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: defaultProps
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.props("variant")).toBe("none");
		});

		it("is configured for multiple selection", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: defaultProps
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			expect(selectMenu.props("multiple")).toBe(true);
		});
	});

	describe("items handling", () => {
		it("provides items to select menu sorted alphabetically", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, items: ["Zebra", "Apple", "Mango"] }
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			const items = selectMenu.props("items") as string[];
			expect(items).toEqual(["Apple", "Mango", "Zebra"]);
		});
	});

	describe("filter states", () => {
		it("uses muted trailing icon color when not filtered and closed", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, isFiltered: false }
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			const ui = selectMenu.props("ui") as Record<string, string>;
			expect(ui.trailingIcon).toContain("text-muted");
		});

		it("uses primary trailing icon color when filtered", async () => {
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, isFiltered: true }
			});
			const selectMenu = wrapper.findComponent({ name: "USelectMenu" });
			const ui = selectMenu.props("ui") as Record<string, string>;
			expect(ui.trailingIcon).toContain("text-primary");
		});
	});

	describe("onUpdate callback", () => {
		it("calls onUpdate with empty Set on mount", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			expect(mockOnUpdate).toHaveBeenCalledWith(new Set());
		});

		it("calls onUpdate with empty Set when unmounted", async () => {
			const mockOnUpdate = vi.fn();
			const wrapper = await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			wrapper.unmount();
			expect(mockOnUpdate).toHaveBeenCalledWith(new Set());
		});

		it("calls onUpdate when selection changes", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			mockOnUpdate.mockClear();
			localStorageRef.value = ["Option A", "Option B"];
			await nextTick();
			expect(mockOnUpdate).toHaveBeenCalledWith(new Set(["Option A", "Option B"]));
		});
	});

	describe("event bus", () => {
		it("registers event bus listener on mount", async () => {
			await mountSuspended(MultiSelectFilter, {
				props: defaultProps
			});
			expect(mockEventBusOn).toHaveBeenCalled();
		});

		it("clears selection when clear event is received", async () => {
			const mockOnUpdate = vi.fn();
			await mountSuspended(MultiSelectFilter, {
				props: { ...defaultProps, onUpdate: mockOnUpdate }
			});
			// Simulate adding selections
			localStorageRef.value = ["Option A"];
			await nextTick();
			mockOnUpdate.mockClear();
			// Trigger clear event
			const callback = eventBusCallback();
			callback!("clear");
			await nextTick();
			expect(localStorageRef.value).toEqual([]);
		});
	});
});
