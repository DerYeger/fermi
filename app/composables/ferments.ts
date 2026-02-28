import { and, eq, lt, not, useLiveQuery } from "@tanstack/vue-db";
import * as s from "@yeger/streams/sync";

export function useFerments() {
	return useLiveQuery((q) => q.from({ ferment: FermentCollection }));
}

export function useActiveFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.state, "active"))
			.orderBy(({ ferment }) => ferment.startDate, "asc")
	);
}

export function useCompletedFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.state, "completed"))
			.orderBy(({ ferment }) => ferment.endDate, "desc")
	);
}

export function useFailedFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.state, "failed"))
			.orderBy(({ ferment }) => ferment.endDate, "desc")
	);
}

export function useArchivedFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => not(eq(ferment.state, "active")))
			.orderBy(({ ferment }) => ferment.endDate, "desc")
	);
}

export function useFermentById(id: MaybeRefOrGetter<string>) {
	return useLiveQuery((q) => q.from({ ferment: FermentCollection }).where(({ ferment }) => eq(ferment.id, toValue(id))).findOne(), [id]);
}

export function useIngredients() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.select(({ ferment }) => ({ ingredients: ferment.ingredients }))
	);
}

export function useFermentNames(otherNames: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useLiveQuery((q) => q.from({ ferment: FermentCollection }).select(({ ferment }) => ({ name: ferment.name })));
	return computed(() =>
		s.toArray(s.pipe(
			query.data.value ?? [],
			s.map((item) => item.name),
			s.append(toValue(otherNames)),
			s.distinct()
		)).sort((a, b) => a.localeCompare(b))
	);
}

export function useFermentContainers(otherContainers: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useLiveQuery((q) => q.from({ ferment: FermentCollection }).select(({ ferment }) => ({ container: ferment.container })));
	return computed(() =>
		s.toArray(s.pipe(
			query.data.value ?? [],
			s.map((item) => item.container),
			s.filterDefined(),
			s.append(toValue(otherContainers)),
			s.distinct()
		)).sort((a, b) => a.localeCompare(b))
	);
}

export function useIngredientNames(otherNames: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		s.toArray(s.pipe(
			query.data.value ?? [],
			s.flatMap((item) => item.ingredients),
			s.map((ingredient) => ingredient.name),
			s.append(toValue(otherNames)),
			s.distinct()
		)).sort((a, b) => a.localeCompare(b))
	);
}

export const PREDEFINED_UNITS = {
	Metric: ["g", "kg", "ml", "l"],
	Imperial: ["fl oz", "lb", "oz"],
	Other: ["cups", "pieces", "slices", "tbsp", "tsp"]
} as const;
const PREDEFINED_UNITS_SET = new Set<string>(Object.values(PREDEFINED_UNITS).flat());

const PREDEFINED_UNITS_TO_FORMATTER_UNIT: Record<string, string | undefined> = {
	g: "gram",
	kg: "kilogram",
	ml: "milliliter",
	l: "liter",
	oz: "ounce",
	"fl oz": "fluid-ounce",
	lb: "pound",
	cups: undefined,
	pieces: undefined,
	slices: undefined,
	tbsp: undefined,
	tsp: undefined
} satisfies Record<typeof PREDEFINED_UNITS[keyof typeof PREDEFINED_UNITS][number], string | undefined>;

export function formatQuantity(quantity: number, unit: string) {
	try {
		return Intl.NumberFormat(undefined, {
			maximumFractionDigits: 2,
			style: "unit",
			unit: PREDEFINED_UNITS_TO_FORMATTER_UNIT[unit] ?? unit
		}).format(quantity);
	} catch {
		return `${Intl.NumberFormat(undefined, {
			maximumFractionDigits: 2
		}).format(quantity)} ${unit}`;
	}
}

export function useIngredientUnits(otherUnits: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		s.toArray(s.pipe(
			query.data.value ?? [],
			s.flatMap((item) => item.ingredients),
			s.map((ingredient) => ingredient.unit),
			s.append(toValue(otherUnits)),
			s.filter((unit) => !PREDEFINED_UNITS_SET.has(unit)),
			s.distinct()
		)).sort((a, b) => a.localeCompare(b))
	);
}

export const useDueFerments = createGlobalState(() => {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => and(eq(ferment.state, "active"), eq(ferment.endDate, today.value)))
			.orderBy(({ ferment }) => ferment.endDate, "asc"), [today]);
});

export const useOverdueFerments = createGlobalState(() => {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => and(eq(ferment.state, "active"), lt(ferment.endDate, today.value)))
			.orderBy(({ ferment }) => ferment.endDate, "asc"), [today]);
});
