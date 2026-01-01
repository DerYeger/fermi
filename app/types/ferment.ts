const TrimmedString = z.string().trim();

export const IngredientSchema = z.object({
	id: z.string(),
	name: TrimmedString.min(1, "Name is required"),
	quantity: z.number("Quantity is required").gt(0, "Must be positive"),
	unit: TrimmedString.min(1, "Unit is required")
});
export type Ingredient = zInfer<typeof IngredientSchema>;

export const FermentImageSchema = z.object({
	id: z.string(),
	base64: z.string(),
	date: z.iso.date("Image date is required")
});
export type FermentImage = zInfer<typeof FermentImageSchema>;

export const MAX_NOTES_LENGTH = 5000;
const NotesSchema = TrimmedString.max(MAX_NOTES_LENGTH, "Notes cannot exceed 5000 characters");

const FermentBaseSchema = z.object({
	version: z.literal(1),
	id: z.string(),
	name: TrimmedString.min(1, "Name is required"),
	container: TrimmedString.nullable().transform((val) => val || null),
	ingredients: z.array(IngredientSchema),
	saltRatio: z.number().min(0, "Cannot be negative").max(1, "Cannot exceed 100%"),
	notes: NotesSchema,
	images: z.array(FermentImageSchema),
	startDate: z.iso.date("Start date is required"),
	endDate: z.iso.date().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime(),
	isFavorite: z.boolean()
});
export type FermentBase = zInfer<typeof FermentBaseSchema>;

export const ActiveFermentSchema = FermentBaseSchema.extend({
	state: z.literal("active")
});
export type ActiveFerment = zInfer<typeof ActiveFermentSchema>;

export const MAX_STARS = 5;
export const RatingSchema = z.object({
	stars: z.number().min(1).max(MAX_STARS).nullable(),
	notes: NotesSchema
}).default({
	stars: null,
	notes: ""
});
export type Rating = zInfer<typeof RatingSchema>;

export interface RatingCategory {
	key: string
	name: string
	/**
	 * @IconifyIcon
	 */
	icon: string
	placeholder: string
}

export const RATING_CATEGORIES = [
	{
		key: "overall",
		name: "Overall",
		icon: "hugeicons:star-award-01",
		placeholder: "Overall impression"
	},
	{
		key: "flavor",
		name: "Flavor",
		icon: "hugeicons:vegetarian-food",
		placeholder: "Saltiness, sourness, and taste"
	},
	{
		key: "texture",
		name: "Texture",
		icon: "hugeicons:kitchen-utensils",
		placeholder: "Texture, crunchiness, and fizz"
	},
	{
		key: "smell",
		name: "Smell",
		icon: "hugeicons:nose",
		placeholder: "Aroma and smell"
	},
	{
		key: "process",
		name: "Process",
		icon: "hugeicons:chef-hat",
		placeholder: "Preparation and fermentation process"
	}
] as const satisfies RatingCategory[];

export const CompletedFermentSchema = FermentBaseSchema.extend({
	state: z.literal("completed"),
	endDate: z.iso.date("End date is required"),
	overall: RatingSchema,
	flavor: RatingSchema,
	texture: RatingSchema,
	smell: RatingSchema,
	process: RatingSchema
});
export type CompletedFerment = zInfer<typeof CompletedFermentSchema>;

export const FailedFermentSchema = FermentBaseSchema.extend({
	state: z.literal("failed"),
	endDate: z.iso.date("End date is required"),
	reason: NotesSchema
});
export type FailedFerment = zInfer<typeof FailedFermentSchema>;

export const FermentSchema = z.discriminatedUnion("state", [
	ActiveFermentSchema,
	CompletedFermentSchema,
	FailedFermentSchema
]);
export type Ferment = zInfer<typeof FermentSchema>;

export type ArchivedFerment = CompletedFerment | FailedFerment;

export type FermentState = Ferment["state"];

export function transitionToActive(ferment: ArchivedFerment): ActiveFerment {
	return ActiveFermentSchema.parse({
		...ferment,
		state: "active",
		updatedAt: getISODatetime()
	} satisfies ActiveFerment);
};
