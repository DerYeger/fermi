export function useTimeSince(dateString: MaybeRefOrGetter<string>) {
	return computed(() => {
		const diffDays = getDaysBetween(toValue(dateString), getISODate());

		return new Intl.NumberFormat("en", {
			style: "unit",
			unit: "day",
			unitDisplay: "long"
		}).format(diffDays);
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

export function getISODate(date = new Date()) {
	return date.toISOString().split("T")[0]!;
}

export function getISODatetime(date = new Date()) {
	return date.toISOString();
}

export function getDaysBetween(startDate: string, endDate: string) {
	const start = new Date(startDate);
	const end = new Date(endDate);
	const diffTime = Math.abs(end.getTime() - start.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
