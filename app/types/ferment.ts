export const IngredientSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	amount: z.number("Amount is required").gt(0, "Must be positive"),
	unit: z.string().min(1, "Unit is required")
});

export type Ingredient = zInfer<typeof IngredientSchema>;

const FermentImageSchema = z.object({
	id: z.string(),
	base64: z.string(),
	date: z.iso.date()
});
export type FermentImage = zInfer<typeof FermentImageSchema>;

export const MAX_NOTES_LENGTH = 5000;
const NotesSchema = z.string().max(MAX_NOTES_LENGTH, "Notes cannot exceed 5000 characters");

const FermentBaseSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
	saltRatio: z.number().min(0, "Cannot be negative"),
	notes: NotesSchema,
	images: z.array(FermentImageSchema),
	startDate: z.iso.date(),
	endDate: z.iso.date().optional(),
	createdAt: z.iso.datetime(),
	updatedAt: z.iso.datetime()
});
export type FermentBase = zInfer<typeof FermentBaseSchema>;

export const ActiveFermentSchema = FermentBaseSchema.extend({
	state: z.literal("active")
});
export type ActiveFerment = zInfer<typeof ActiveFermentSchema>;

export const RatingSchema = z.object({
	stars: z.number().min(1).max(5).optional(),
	notes: NotesSchema.optional()
});

export const CompletedFermentSchema = FermentBaseSchema.extend({
	state: z.literal("completed"),
	endDate: z.iso.date(),
	overall: RatingSchema,
	flavor: RatingSchema,
	texture: RatingSchema,
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
		endDate: undefined,
		updatedAt: new Date().toISOString()
	} satisfies ActiveFerment);
};
