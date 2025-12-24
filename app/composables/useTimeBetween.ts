export function useTimeSince(dateString: MaybeRefOrGetter<string>) {
	return computed(() => {
		const from = new Date(toValue(dateString));
		const diffMs = from.getTime() - new Date().getTime();
		const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

		const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
		return rtf.format(diffDays, "day");
	});
}
