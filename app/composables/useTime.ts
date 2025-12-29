import type { DateValue } from "@internationalized/date";
import type { ActiveFerment } from "~/types/ferment";
import { CalendarDate } from "@internationalized/date";

const LOCALE = navigator.language;

const now = useNow({ interval: 60 * 60 * 1000 });

const timeSinceFormat = Intl.NumberFormat(LOCALE, {
	style: "unit",
	unit: "day",
	unitDisplay: "long"
});
export function formatTimeSince(dateString: MaybeRefOrGetter<string>, startDate = getISODate()) {
	const diffDays = getDaysBetween(toValue(dateString), startDate);

	return timeSinceFormat.format(diffDays);
}

const dateFormat = Intl.DateTimeFormat(LOCALE, {
	month: "short",
	day: "numeric",
	year: "numeric"
});
export function formatDate(date: string) {
	return dateFormat.format(new Date(date));
}

const timeFormat = Intl.DateTimeFormat(LOCALE, {
	month: "short",
	day: "numeric",
	year: "numeric",
	hour: "numeric",
	minute: "2-digit"
});
export function formatDateTime(date: string) {
	return timeFormat.format(new Date(date));
}

export function getISODate(date: Date | DateValue = now.value) {
	const isoString = date instanceof Date ? date.toISOString() : date.toString();
	return isoString.split("T")[0]!;
}

export function getISODatetime(date = now.value) {
	return date.toISOString();
}

export function getDaysBetween(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isStartDateUnavailable(endDate: string | undefined | null, startDate: DateValue) {
	if (!endDate) return false;
	return getISODate(startDate) > endDate;
}

export function isEndDateUnavailable(startDate: string | undefined | null, endDate: DateValue) {
	if (!startDate) return false;
	return getISODate(endDate) < startDate;
}

export function isFermentOverdue(ferment: ActiveFerment) {
	if (!ferment.endDate) return false;
	const today = getISODate();
	return ferment.endDate < today;
}

export function getCalendarDate(date: Date = now.value) {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export const FIRST_WEEK_DAY = 1; // Monday
