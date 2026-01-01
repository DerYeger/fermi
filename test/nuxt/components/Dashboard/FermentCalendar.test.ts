import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";

// Mock composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useFerments: () => ({
			data: { value: [] },
			isLoading: { value: false }
		}),
		getISODate: (date: { toString: () => string }) => {
			if (typeof date === "string") return date;
			if (date && typeof date.toString === "function") return date.toString().split("T")[0];
			return "2024-01-15";
		},
		FIRST_WEEK_DAY: 1,
		todayCalendarDate: { year: 2024, month: 1, day: 15 }
	};
});

describe("components/Dashboard/FermentCalendar", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Calendar");
		expect(header.props("icon")).toBe("hugeicons:calendar-03");
	});

	it("renders UCalendar component", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const calendar = wrapper.findComponent({ name: "UCalendar" });
		expect(calendar.exists()).toBe(true);
	});

	it("renders UChip components for legend", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const chips = wrapper.findAllComponents({ name: "UChip" });
		expect(chips.length).toBeGreaterThanOrEqual(3);
	});

	it("renders success chip for Started legend", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const chips = wrapper.findAllComponents({ name: "UChip" });
		const successChip = chips.find((chip) => chip.props("color") === "success");
		expect(successChip).toBeDefined();
	});

	it("renders warning chip for Ended legend", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const chips = wrapper.findAllComponents({ name: "UChip" });
		const warningChip = chips.find((chip) => chip.props("color") === "warning");
		expect(warningChip).toBeDefined();
	});

	it("renders error chip for Both legend", async () => {
		const wrapper = await mountSuspended(FermentCalendar);
		const chips = wrapper.findAllComponents({ name: "UChip" });
		const errorChip = chips.find((chip) => chip.props("color") === "error");
		expect(errorChip).toBeDefined();
	});
});
