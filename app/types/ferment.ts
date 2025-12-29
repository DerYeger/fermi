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
	id: z.string(),
	name: TrimmedString.min(1, "Name is required"),
	container: TrimmedString.nullable().transform((val) => val || null),
	ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
	saltRatio: z.number().min(0, "Cannot be negative").max(1, "Cannot exceed 100%"),
	notes: NotesSchema,
	images: z.array(FermentImageSchema),
	startDate: z.iso.date("Start date is required"),
	endDate: z.iso.date().nullable(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime()
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
	icon: string
	placeholder: string
}
export const RATING_CATEGORIES = [
	{
		key: "overall",
		name: "Overall",
		icon: "lucide:trophy",
		placeholder: "Overall impression"
	},
	{
		key: "flavor",
		name: "Flavor",
		icon: "lucide:leafy-green",
		placeholder: "Saltiness, sourness, and taste"
	},
	{
		key: "texture",
		name: "Texture",
		icon: "lucide:utensils",
		placeholder: "Texture, crunchiness, and fizz"
	},
	{
		key: "smell",
		name: "Smell",
		icon: "lucide:soup",
		placeholder: "Aroma and smell"
	},
	{
		key: "process",
		name: "Process",
		icon: "lucide:chef-hat",
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

export const FermentSchema = z.discriminatedUnion("state", [
	ActiveFermentSchema,
	CompletedFermentSchema
]);
export type Ferment = zInfer<typeof FermentSchema>;

export type FermentState = Ferment["state"];

export function transitionToActive(ferment: CompletedFerment): ActiveFerment {
	return ActiveFermentSchema.parse({
		...ferment,
		state: "active",
		endDate: null,
		updatedAt: getISODatetime()
	} satisfies ActiveFerment);
};
