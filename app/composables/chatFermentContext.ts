import type { Ferment } from "~/types/ferment";
import { ActiveFermentSchema, CompletedFermentSchema, FailedFermentSchema, IngredientSchema } from "~/types/ferment";

const MinimalIngredientSchema = IngredientSchema.omit({ id: true });

const sharedOmits = { images: true, notes: true, ingredients: true } as const;

const FermentContextSchema = z.discriminatedUnion("state", [
	ActiveFermentSchema.omit(sharedOmits).extend({
		ingredients: z.array(MinimalIngredientSchema)
	}),
	CompletedFermentSchema.omit({ ...sharedOmits, overall: true, flavor: true, texture: true, smell: true, process: true }).extend({
		ingredients: z.array(MinimalIngredientSchema)
	}),
	FailedFermentSchema.omit({ ...sharedOmits, reason: true }).extend({
		ingredients: z.array(MinimalIngredientSchema)
	})
]);
type FermentContext = zInfer<typeof FermentContextSchema>;

export const useChatFermentContext = createGlobalState(() => {
	const selectedFerment = ref<Ferment | null>(null);

	function selectFerment(ferment: Ferment) {
		selectedFerment.value = ferment;
	}

	function clearSelection() {
		selectedFerment.value = null;
	}

	function getSelectionContext(): FermentContext | null {
		if (!selectedFerment.value) return null;
		return FermentContextSchema.safeParse(selectedFerment.value).data ?? null;
	}

	const hasSelection = computed(() => selectedFerment.value !== null);

	return {
		selectedFerment: readonly(selectedFerment),
		selectFerment,
		clearSelection,
		getSelectionContext,
		hasSelection
	};
});
