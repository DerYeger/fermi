export const IngredientSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	amount: z.number().min(0.0001, "Amount must be greater than zero"),
	unit: z.string().min(1, "Unit is required")
});

export type Ingredient = zInfer<typeof IngredientSchema>;

const FermentBaseSchema = z.object({
	id: z.string(),
	name: z.string().min(1, "Name is required"),
	ingredients: z.array(IngredientSchema).min(1, "At least one ingredient is required"),
	saltRatio: z.number().min(0, "Salt ratio cannot be negative"),
	notes: z.string(),
	imagePaths: z.array(z.string()).optional().default([]),
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
	notes: z.string().optional()
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
  } satisfies ActiveFerment)
};
