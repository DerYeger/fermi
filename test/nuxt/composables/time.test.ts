import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// Mock useNow to control time in tests
mockNuxtImport("useNow", () => {
	return () => ref(new Date("2026-01-15T12:00:00.000Z"));
});

describe("composables/time", () => {
	describe("today", () => {
		it("should return today's ISO date string", async () => {
			const { today } = await import("~/composables/time");
			expect(today.value).toBe("2026-01-15");
		});
	});

	describe("todayCalendarDate", () => {
		it("should return a CalendarDate for today", async () => {
			const { todayCalendarDate } = await import("~/composables/time");
			expect(todayCalendarDate.value.year).toBe(2026);
			expect(todayCalendarDate.value.month).toBe(1);
			expect(todayCalendarDate.value.day).toBe(15);
		});
	});

	describe("formatTimeSince", () => {
		it("should format days between dates", async () => {
			const { formatTimeSince } = await import("~/composables/time");
			const result = formatTimeSince("2026-01-10", "2026-01-15");
			expect(result).toContain("5");
			expect(result.toLowerCase()).toContain("day");
		});

		it("should handle same day", async () => {
			const { formatTimeSince } = await import("~/composables/time");
			const result = formatTimeSince("2026-01-15", "2026-01-15");
			expect(result).toContain("0");
		});
	});

	describe("formatDate", () => {
		it("should format date in readable format", async () => {
			const { formatDate } = await import("~/composables/time");
			const result = formatDate("2026-01-15");
			expect(result).toContain("15");
			expect(result).toContain("2026");
		});
	});

	describe("formatDateTime", () => {
		it("should format datetime with time", async () => {
			const { formatDateTime } = await import("~/composables/time");
			const result = formatDateTime("2026-01-15T14:30:00.000Z");
			expect(result).toContain("15");
			expect(result).toContain("2026");
		});
	});

	describe("getISODate", () => {
		it("should return ISO date from Date object and CalendarDate", async () => {
			const { CalendarDate } = await import("@internationalized/date");
			const { getISODate } = await import("~/composables/time");
			const date = new Date("2026-03-20T10:00:00.000Z");
			expect(getISODate(date)).toBe("2026-03-20");
			const calDate = new CalendarDate(2026, 5, 10);
			expect(getISODate(calDate)).toBe("2026-05-10");
		});
	});

	describe("getISODatetime", () => {
		it("should return full ISO datetime string", async () => {
			const { getISODatetime } = await import("~/composables/time");
			const date = new Date("2026-01-15T14:30:00.000Z");
			expect(getISODatetime(date)).toBe("2026-01-15T14:30:00.000Z");
		});
	});

	describe("getDaysBetween", () => {
		it("should calculate days between two dates", async () => {
			const { getDaysBetween } = await import("~/composables/time");
			expect(getDaysBetween("2026-01-01", "2026-01-10")).toBe(9);
			expect(getDaysBetween("2026-01-15", "2026-01-15")).toBe(0);
			expect(getDaysBetween("2026-01-10", "2026-01-01")).toBe(9);
		});
	});

	describe("isStartDateUnavailable", () => {
		it("should validate start date availability based on end date", async () => {
			const { CalendarDate } = await import("@internationalized/date");
			const { isStartDateUnavailable } = await import("~/composables/time");
			const startDate = new CalendarDate(2026, 1, 10);
			expect(isStartDateUnavailable(null, startDate)).toBe(false);
			expect(isStartDateUnavailable(undefined, startDate)).toBe(false);
			const startDateAfter = new CalendarDate(2026, 1, 20);
			expect(isStartDateUnavailable("2026-01-15", startDateAfter)).toBe(true);
			expect(isStartDateUnavailable("2026-01-15", startDate)).toBe(false);
		});
	});

	describe("isEndDateUnavailable", () => {
		it("should validate end date availability based on start date", async () => {
			const { CalendarDate } = await import("@internationalized/date");
			const { isEndDateUnavailable } = await import("~/composables/time");
			const endDate = new CalendarDate(2026, 1, 20);
			expect(isEndDateUnavailable(null, endDate)).toBe(false);
			expect(isEndDateUnavailable(undefined, endDate)).toBe(false);
			const endDateBefore = new CalendarDate(2026, 1, 5);
			expect(isEndDateUnavailable("2026-01-10", endDateBefore)).toBe(true);
			expect(isEndDateUnavailable("2026-01-10", endDate)).toBe(false);
		});
	});

	describe("isFermentOverdue", () => {
		it("should correctly determine if ferment is overdue based on end date", async () => {
			const { isFermentOverdue } = await import("~/composables/time");
			const fermentNoEnd = { endDate: null } as Parameters<typeof isFermentOverdue>[0];
			expect(isFermentOverdue(fermentNoEnd)).toBe(false);
			const fermentPast = { endDate: "2026-01-10" } as Parameters<typeof isFermentOverdue>[0];
			expect(isFermentOverdue(fermentPast)).toBe(true);
			const fermentToday = { endDate: "2026-01-15" } as Parameters<typeof isFermentOverdue>[0];
			expect(isFermentOverdue(fermentToday)).toBe(false);
			const fermentFuture = { endDate: "2026-01-20" } as Parameters<typeof isFermentOverdue>[0];
			expect(isFermentOverdue(fermentFuture)).toBe(false);
		});
	});

	describe("getCalendarDate and FIRST_WEEK_DAY", () => {
		it("should convert Date to CalendarDate and have FIRST_WEEK_DAY as Monday", async () => {
			const { getCalendarDate, FIRST_WEEK_DAY } = await import("~/composables/time");
			const date = new Date(2026, 4, 15); // May 15, 2026
			const calDate = getCalendarDate(date);
			expect(calDate.year).toBe(2026);
			expect(calDate.month).toBe(5);
			expect(calDate.day).toBe(15);
			expect(FIRST_WEEK_DAY).toBe(1);
		});
	});
});
