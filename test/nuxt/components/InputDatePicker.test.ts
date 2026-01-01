import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import InputDatePicker from "~/components/InputDatePicker.vue";

// Mock imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FIRST_WEEK_DAY: 1,
		formatDate: (date: string) => date,
		getCalendarDate: () => ({ year: 2024, month: 1, day: 15 }),
		getISODate: () => "2024-01-15"
	};
});

describe("components/InputDatePicker", () => {
	it("renders UButton with calendar icon, variant and color props", async () => {
		const wrapper = await mountSuspended(InputDatePicker, {
			props: {
				modelValue: "2024-01-15"
			}
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:calendar-03");
		expect(button.props("color")).toBe("neutral");
		expect(button.props("variant")).toBe("subtle");
	});

	it("renders UPopover component", async () => {
		const wrapper = await mountSuspended(InputDatePicker, {
			props: {
				modelValue: "2024-01-15"
			}
		});
		const popover = wrapper.findComponent({ name: "UPopover" });
		expect(popover.exists()).toBe(true);
	});
});
