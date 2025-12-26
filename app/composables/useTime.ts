export function useTimeSince(dateString: MaybeRefOrGetter<string>) {
	return computed(() => {
		const from = new Date(toValue(dateString));
		const diffMs = from.getTime() - new Date().getTime();
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
		return rtf.format(diffDays, "day");
	});
}

export function formatDate(date: string) {
	return Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric"
	}).format(new Date(date));
}

export function formatDateTime(date: string) {
	return Intl.DateTimeFormat("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "numeric",
		minute: "2-digit"
	}).format(new Date(date));
}

export function getCurrentISODate() {
	return new Date().toISOString().split("T")[0]!;
}

export function getDaysBetween(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
