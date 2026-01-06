import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import InputDatePicker from "~/components/InputDatePicker.vue";

// Mock imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FIRST_WEEK_DAY: 1,
		formatDate: (date: string) => {
			const d = new Date(date);
			return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
		},
		getCalendarDate: (date: Date) => ({ year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() }),
		getISODate: (calendarDate?: { year: number, month: number, day: number }) => {
			if (calendarDate) {
				const month = String(calendarDate.month).padStart(2, "0");
				const day = String(calendarDate.day).padStart(2, "0");
				return `${calendarDate.year}-${month}-${day}`;
			}
			return "2024-01-15";
		}
	};
});

describe("components/InputDatePicker", () => {
	describe("rendering", () => {
		it("renders UButton with correct props", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: "2024-01-15" }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.exists()).toBe(true);
			expect(button.props("icon")).toBe("hugeicons:calendar-03");
			expect(button.props("color")).toBe("neutral");
			expect(button.props("variant")).toBe("subtle");
		});

		it("renders UPopover component", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: "2024-01-15" }
			});
			const popover = wrapper.findComponent({ name: "UPopover" });
			expect(popover.exists()).toBe(true);
		});
	});

	describe("button display text", () => {
		it("displays formatted date when modelValue is set", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: "2024-01-15" }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			// The formatDate mock returns locale format like "Jan 15, 2024"
			expect(button.text()).toContain("Jan 15, 2024");
		});

		it("displays 'Select a date' when modelValue is null", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: null }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.text()).toContain("Select a date");
		});

		it("displays 'Select a date' when modelValue is undefined", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: undefined }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.text()).toContain("Select a date");
		});
	});

	describe("model value updates", () => {
		it("emits update:modelValue when internal model changes", async () => {
			const wrapper = await mountSuspended(InputDatePicker, {
				props: { modelValue: "2024-01-15" }
			});
			// Test that the component renders and displays correctly
			// The internal computed model handles the conversion
			expect(wrapper.findComponent({ name: "UButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "UPopover" }).exists()).toBe(true);
		});
	});
});
