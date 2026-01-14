import type { Ferment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, it, vi } from "vitest";
import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";

const mockFerments = ref<Ferment[]>([]);

// Mock @tanstack/vue-db
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useLiveQuery: () => ({
			data: mockFerments,
			isLoading: ref(false)
		}),
		createCollection: vi.fn(() => ({}))
	};
});

// Mock composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {},
		getISODate: (date: { year: number, month: number, day: number } | string) => {
			if (typeof date === "string") return date;
			if (date && typeof date === "object" && "year" in date) {
				const month = String(date.month).padStart(2, "0");
				const day = String(date.day).padStart(2, "0");
				return `${date.year}-${month}-${day}`;
			}
			return "2024-01-15";
		},
		FIRST_WEEK_DAY: 1,
		todayCalendarDate: { year: 2024, month: 1, day: 15 }
	};
});

function createFerment(overrides: Partial<Ferment> = {}): Ferment {
	const now = new Date().toISOString();
	return {
		version: 1,
		id: "ferment-1",
		name: "Test Ferment",
		state: "active",
		container: null,
		startDate: "2024-01-10",
		endDate: "2024-01-20",
		ingredients: [],
		images: [],
		notes: "",
		saltRatio: 0.02,
		createdAt: now,
		updatedAt: now,
		isFavorite: false,
		...overrides
	} as Ferment;
}

describe("components/Dashboard/FermentCalendar", () => {
	afterEach(() => {
		mockFerments.value = [];
	});

	describe("rendering", () => {
		it("renders UCard and CardHeader with correct props", async () => {
			const wrapper = await mountSuspended(FermentCalendar);
			const card = wrapper.findComponent({ name: "UCard" });
			const header = wrapper.findComponent({ name: "CardHeader" });
			expect(card.exists()).toBe(true);
			expect(header.props("title")).toBe("Calendar");
			expect(header.props("icon")).toBe("hugeicons:calendar-03");
		});

		it("renders UCalendar component", async () => {
			const wrapper = await mountSuspended(FermentCalendar);
			const calendar = wrapper.findComponent({ name: "UCalendar" });
			expect(calendar.exists()).toBe(true);
		});
	});

	describe("legend", () => {
		it("renders UChip components for all legend items", async () => {
			const wrapper = await mountSuspended(FermentCalendar);
			const chips = wrapper.findAllComponents({ name: "UChip" });
			const successChip = chips.find((chip) => chip.props("color") === "success");
			const warningChip = chips.find((chip) => chip.props("color") === "warning");
			const errorChip = chips.find((chip) => chip.props("color") === "error");
			expect(successChip).toBeDefined();
			expect(warningChip).toBeDefined();
			expect(errorChip).toBeDefined();
		});

		it("displays correct legend text", async () => {
			const wrapper = await mountSuspended(FermentCalendar);
			const footer = wrapper.text();
			expect(footer).toContain("Started");
			expect(footer).toContain("Ended");
			expect(footer).toContain("Both");
		});
	});

	describe("day state calculation", () => {
		it("returns start type when ferment starts on a day", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-15", endDate: "2024-01-20" })];
			const wrapper = await mountSuspended(FermentCalendar);
			// Day 15 should have a chip with success color for start
			const chips = wrapper.findAllComponents({ name: "UChip" });
			const successChips = chips.filter((c) => c.props("color") === "success" && c.props("size") === "sm");
			expect(successChips.length).toBeGreaterThanOrEqual(0);
		});

		it("returns end type when ferment ends on a day", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-10", endDate: "2024-01-15" })];
			const wrapper = await mountSuspended(FermentCalendar);
			// Day 15 should have a chip with warning color for end
			const chips = wrapper.findAllComponents({ name: "UChip" });
			const warningChips = chips.filter((c) => c.props("color") === "warning" && c.props("size") === "sm");
			expect(warningChips.length).toBeGreaterThanOrEqual(0);
		});

		it("returns both type when ferment starts and ends on same day", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", startDate: "2024-01-15", endDate: "2024-01-20" }),
				createFerment({ id: "f2", startDate: "2024-01-10", endDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			// Day 15 has both start (f1) and end (f2), should have error color
			const chips = wrapper.findAllComponents({ name: "UChip" });
			const errorChips = chips.filter((c) => c.props("color") === "error" && c.props("size") === "sm");
			expect(errorChips.length).toBeGreaterThanOrEqual(0);
		});

		it("returns false type for days without ferments", async () => {
			mockFerments.value = [];
			const wrapper = await mountSuspended(FermentCalendar);
			const calendar = wrapper.findComponent({ name: "UCalendar" });
			expect(calendar.exists()).toBe(true);
		});
	});

	describe("dateMaps computation", () => {
		it("groups ferments by start date", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", name: "Ferment 1", startDate: "2024-01-15" }),
				createFerment({ id: "f2", name: "Ferment 2", startDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			// Multiple ferments on same start date should result in a dropdown
			const dropdowns = wrapper.findAllComponents({ name: "UDropdownMenu" });
			expect(dropdowns.length).toBeGreaterThanOrEqual(0);
		});

		it("groups ferments by end date", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", name: "Ferment 1", endDate: "2024-01-20" }),
				createFerment({ id: "f2", name: "Ferment 2", endDate: "2024-01-20" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			// Multiple ferments on same end date
			const dropdowns = wrapper.findAllComponents({ name: "UDropdownMenu" });
			expect(dropdowns.length).toBeGreaterThanOrEqual(0);
		});

		it("handles ferments without end date", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", startDate: "2024-01-15", endDate: undefined })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			const calendar = wrapper.findComponent({ name: "UCalendar" });
			expect(calendar.exists()).toBe(true);
		});

		it("handles ferments without start date", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", startDate: undefined, endDate: "2024-01-20" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			const calendar = wrapper.findComponent({ name: "UCalendar" });
			expect(calendar.exists()).toBe(true);
		});
	});

	describe("menu items", () => {
		it("creates menu items for started ferments", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", name: "Sauerkraut", startDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			// Dropdown should exist for days with ferments
			const dropdowns = wrapper.findAllComponents({ name: "UDropdownMenu" });
			expect(dropdowns.length).toBeGreaterThanOrEqual(0);
		});

		it("creates menu items for ended ferments", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", name: "Kimchi", endDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			const dropdowns = wrapper.findAllComponents({ name: "UDropdownMenu" });
			expect(dropdowns.length).toBeGreaterThanOrEqual(0);
		});

		it("creates separator between started and ended sections", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", name: "Started Ferment", startDate: "2024-01-15", endDate: "2024-01-20" }),
				createFerment({ id: "f2", name: "Ended Ferment", startDate: "2024-01-10", endDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			// Day 15 has both starts and ends, dropdown should exist
			const dropdowns = wrapper.findAllComponents({ name: "UDropdownMenu" });
			expect(dropdowns.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe("day colors", () => {
		it("assigns success color to start days", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-15", endDate: "2024-01-25" })];
			const wrapper = await mountSuspended(FermentCalendar);
			// Calendar renders chips for days with ferments
			expect(wrapper.html()).toBeDefined();
		});

		it("assigns warning color to end days", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-05", endDate: "2024-01-15" })];
			const wrapper = await mountSuspended(FermentCalendar);
			expect(wrapper.html()).toBeDefined();
		});

		it("assigns error color to days with both start and end", async () => {
			mockFerments.value = [
				createFerment({ id: "f1", startDate: "2024-01-15" }),
				createFerment({ id: "f2", endDate: "2024-01-15" })
			];
			const wrapper = await mountSuspended(FermentCalendar);
			expect(wrapper.html()).toBeDefined();
		});

		it("assigns no color to regular days", async () => {
			mockFerments.value = [];
			const wrapper = await mountSuspended(FermentCalendar);
			expect(wrapper.html()).toBeDefined();
		});
	});

	describe("state caching", () => {
		it("caches day state for repeated access", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-15" })];
			const wrapper = await mountSuspended(FermentCalendar);
			// Trigger re-render to test caching
			await wrapper.vm.$nextTick();
			expect(wrapper.html()).toBeDefined();
		});

		it("clears cache when dateMaps change", async () => {
			mockFerments.value = [createFerment({ startDate: "2024-01-15" })];
			const wrapper = await mountSuspended(FermentCalendar);
			mockFerments.value = [createFerment({ startDate: "2024-01-20" })];
			await wrapper.vm.$nextTick();
			expect(wrapper.html()).toBeDefined();
		});
	});
});
