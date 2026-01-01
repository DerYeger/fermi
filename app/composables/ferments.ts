import { and, eq, lt, not, useLiveQuery } from "@tanstack/vue-db";
import { Stream } from "@yeger/streams/sync";

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
		Stream.from(query.data.value ?? [])
			.map((item) => item.name)
			.concat(toValue(otherNames))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
	);
}

export function useFermentContainers(otherContainers: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useLiveQuery((q) => q.from({ ferment: FermentCollection }).select(({ ferment }) => ({ container: ferment.container })));
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.map((item) => item.container)
			.filterNonNull()
			.concat(toValue(otherContainers))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
	);
}

export function useIngredientNames(otherNames: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.flatMap((item) => item.ingredients)
			.map((ingredient) => ingredient.name)
			.concat(toValue(otherNames))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
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
		console.log("fallback", unit);

		return `${Intl.NumberFormat(undefined, {
			maximumFractionDigits: 2
		}).format(quantity)} ${unit}`;
	}
}

export function useIngredientUnits(otherUnits: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.flatMap((item) => item.ingredients)
			.map((ingredient) => ingredient.unit)
			.concat(toValue(otherUnits))
			.filter((unit) => !PREDEFINED_UNITS_SET.has(unit))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
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
