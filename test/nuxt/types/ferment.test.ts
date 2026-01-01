import type { ActiveFerment, CompletedFerment, FailedFerment, FermentImage, Ingredient, Rating } from "~/types/ferment";
import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

// Mock getISODatetime for transitionToActive
mockNuxtImport("getISODatetime", () => {
	return () => "2026-01-01T12:00:00.000Z";
});

// Helper factories
function createMockIngredient(overrides: Partial<Ingredient> = {}): Ingredient {
	return {
		id: "ingredient-1",
		name: "Cabbage",
		quantity: 500,
		unit: "g",
		...overrides
	};
}

function createMockImage(overrides: Partial<FermentImage> = {}): FermentImage {
	return {
		id: "img-1",
		base64: "data:image/png;base64,test",
		date: "2026-01-01",
		...overrides
	};
}

function createMockRating(overrides: Partial<Rating> = {}): Rating {
	return {
		stars: 4,
		notes: "Good fermentation",
		...overrides
	};
}

function createMockActiveFerment(overrides: Partial<ActiveFerment> = {}): ActiveFerment {
	return {
		version: 1,
		id: "ferment-1",
		name: "Test Sauerkraut",
		state: "active",
		createdAt: "2026-01-01T00:00:00.000Z",
		updatedAt: "2026-01-01T00:00:00.000Z",
		startDate: "2026-01-01",
		endDate: null,
		saltRatio: 0.02,
		container: "Mason Jar",
		notes: "",
		ingredients: [createMockIngredient()],
		images: [],
		isFavorite: false,
		...overrides
	};
}

function createMockCompletedFerment(overrides: Partial<CompletedFerment> = {}): CompletedFerment {
	return {
		...createMockActiveFerment(),
		state: "completed",
		endDate: "2026-01-14",
		overall: createMockRating(),
		flavor: createMockRating(),
		texture: createMockRating(),
		smell: createMockRating(),
		process: createMockRating(),
		...overrides
	} as CompletedFerment;
}

function createMockFailedFerment(overrides: Partial<FailedFerment> = {}): FailedFerment {
	return {
		...createMockActiveFerment(),
		state: "failed",
		endDate: "2026-01-10",
		reason: "Mold contamination",
		...overrides
	} as FailedFerment;
}

describe("types/ferment", () => {
	describe("ingredientSchema", () => {
		it("should validate valid ingredient", async () => {
			const { IngredientSchema } = await import("~/types/ferment");
			const ingredient = createMockIngredient();
			const result = IngredientSchema.safeParse(ingredient);
			expect(result.success).toBe(true);
		});

		it("should require non-empty name", async () => {
			const { IngredientSchema } = await import("~/types/ferment");
			const ingredient = createMockIngredient({ name: "" });
			const result = IngredientSchema.safeParse(ingredient);
			expect(result.success).toBe(false);
		});

		it("should require positive quantity", async () => {
			const { IngredientSchema } = await import("~/types/ferment");
			const ingredient = createMockIngredient({ quantity: 0 });
			const result = IngredientSchema.safeParse(ingredient);
			expect(result.success).toBe(false);
		});

		it("should trim whitespace from name", async () => {
			const { IngredientSchema } = await import("~/types/ferment");
			const ingredient = createMockIngredient({ name: "  Garlic  " });
			const result = IngredientSchema.parse(ingredient);
			expect(result.name).toBe("Garlic");
		});

		it("should require non-empty unit", async () => {
			const { IngredientSchema } = await import("~/types/ferment");
			const ingredient = createMockIngredient({ unit: "" });
			const result = IngredientSchema.safeParse(ingredient);
			expect(result.success).toBe(false);
		});
	});

	describe("fermentImageSchema", () => {
		it("should validate valid image", async () => {
			const { FermentImageSchema } = await import("~/types/ferment");
			const image = createMockImage();
			const result = FermentImageSchema.safeParse(image);
			expect(result.success).toBe(true);
		});

		it("should require id", async () => {
			const { FermentImageSchema } = await import("~/types/ferment");
			const image = { base64: "test", date: "2026-01-01" };
			const result = FermentImageSchema.safeParse(image);
			expect(result.success).toBe(false);
		});

		it("should require valid ISO date", async () => {
			const { FermentImageSchema } = await import("~/types/ferment");
			const image = createMockImage({ date: "invalid-date" as string });
			const result = FermentImageSchema.safeParse(image);
			expect(result.success).toBe(false);
		});
	});

	describe("ratingSchema", () => {
		it("should validate valid rating", async () => {
			const { RatingSchema } = await import("~/types/ferment");
			const rating = createMockRating();
			const result = RatingSchema.safeParse(rating);
			expect(result.success).toBe(true);
		});

		it("should allow null stars", async () => {
			const { RatingSchema } = await import("~/types/ferment");
			const rating = createMockRating({ stars: null });
			const result = RatingSchema.safeParse(rating);
			expect(result.success).toBe(true);
		});

		it("should reject stars outside 1-5 range", async () => {
			const { RatingSchema } = await import("~/types/ferment");
			expect(RatingSchema.safeParse({ stars: 0, notes: "" }).success).toBe(false);
			expect(RatingSchema.safeParse({ stars: 6, notes: "" }).success).toBe(false);
		});

		it("should accept stars 1-5", async () => {
			const { RatingSchema } = await import("~/types/ferment");
			for (let i = 1; i <= 5; i++) {
				const result = RatingSchema.safeParse({ stars: i, notes: "" });
				expect(result.success).toBe(true);
			}
		});

		it("should provide default values", async () => {
			const { RatingSchema } = await import("~/types/ferment");
			const result = RatingSchema.parse(undefined);
			expect(result.stars).toBeNull();
			expect(result.notes).toBe("");
		});
	});

	describe("activeFermentSchema", () => {
		it("should validate valid active ferment", async () => {
			const { ActiveFermentSchema } = await import("~/types/ferment");
			const ferment = createMockActiveFerment();
			const result = ActiveFermentSchema.safeParse(ferment);
			expect(result.success).toBe(true);
		});

		it("should require state to be active", async () => {
			const { ActiveFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockActiveFerment(), state: "completed" };
			const result = ActiveFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});

		it("should validate saltRatio bounds", async () => {
			const { ActiveFermentSchema } = await import("~/types/ferment");
			expect(ActiveFermentSchema.safeParse(createMockActiveFerment({ saltRatio: -0.1 })).success).toBe(false);
			expect(ActiveFermentSchema.safeParse(createMockActiveFerment({ saltRatio: 1.1 })).success).toBe(false);
			expect(ActiveFermentSchema.safeParse(createMockActiveFerment({ saltRatio: 0 })).success).toBe(true);
			expect(ActiveFermentSchema.safeParse(createMockActiveFerment({ saltRatio: 1 })).success).toBe(true);
		});

		it("should require version 1", async () => {
			const { ActiveFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockActiveFerment(), version: 2 };
			const result = ActiveFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});

		it("should allow null endDate", async () => {
			const { ActiveFermentSchema } = await import("~/types/ferment");
			const ferment = createMockActiveFerment({ endDate: null });
			const result = ActiveFermentSchema.safeParse(ferment);
			expect(result.success).toBe(true);
		});
	});

	describe("completedFermentSchema", () => {
		it("should validate valid completed ferment", async () => {
			const { CompletedFermentSchema } = await import("~/types/ferment");
			const ferment = createMockCompletedFerment();
			const result = CompletedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(true);
		});

		it("should require state to be completed", async () => {
			const { CompletedFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockCompletedFerment(), state: "active" };
			const result = CompletedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});

		it("should require endDate", async () => {
			const { CompletedFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockCompletedFerment(), endDate: null };
			const result = CompletedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});
	});

	describe("failedFermentSchema", () => {
		it("should validate valid failed ferment", async () => {
			const { FailedFermentSchema } = await import("~/types/ferment");
			const ferment = createMockFailedFerment();
			const result = FailedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(true);
		});

		it("should require state to be failed", async () => {
			const { FailedFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockFailedFerment(), state: "active" };
			const result = FailedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});

		it("should require endDate", async () => {
			const { FailedFermentSchema } = await import("~/types/ferment");
			const ferment = { ...createMockFailedFerment(), endDate: null };
			const result = FailedFermentSchema.safeParse(ferment);
			expect(result.success).toBe(false);
		});
	});

	describe("fermentSchema (discriminated union)", () => {
		it("should parse active ferment", async () => {
			const { FermentSchema } = await import("~/types/ferment");
			const ferment = createMockActiveFerment();
			const result = FermentSchema.parse(ferment);
			expect(result.state).toBe("active");
		});

		it("should parse completed ferment", async () => {
			const { FermentSchema } = await import("~/types/ferment");
			const ferment = createMockCompletedFerment();
			const result = FermentSchema.parse(ferment);
			expect(result.state).toBe("completed");
		});

		it("should parse failed ferment", async () => {
			const { FermentSchema } = await import("~/types/ferment");
			const ferment = createMockFailedFerment();
			const result = FermentSchema.parse(ferment);
			expect(result.state).toBe("failed");
		});
	});

	describe("transitionToActive", () => {
		it("should convert completed ferment to active", async () => {
			const { transitionToActive } = await import("~/types/ferment");
			const completed = createMockCompletedFerment();
			const active = transitionToActive(completed);

			expect(active.state).toBe("active");
			expect(active.id).toBe(completed.id);
			expect(active.name).toBe(completed.name);
			expect(active.updatedAt).toBe("2026-01-01T12:00:00.000Z");
		});

		it("should convert failed ferment to active", async () => {
			const { transitionToActive } = await import("~/types/ferment");
			const failed = createMockFailedFerment();
			const active = transitionToActive(failed);

			expect(active.state).toBe("active");
			expect(active.id).toBe(failed.id);
		});
	});

	describe("constants", () => {
		it("mAX_NOTES_LENGTH should be 5000", async () => {
			const { MAX_NOTES_LENGTH } = await import("~/types/ferment");
			expect(MAX_NOTES_LENGTH).toBe(5000);
		});

		it("mAX_STARS should be 5", async () => {
			const { MAX_STARS } = await import("~/types/ferment");
			expect(MAX_STARS).toBe(5);
		});

		it("rATING_CATEGORIES should have 5 categories", async () => {
			const { RATING_CATEGORIES } = await import("~/types/ferment");
			expect(RATING_CATEGORIES).toHaveLength(5);
			expect(RATING_CATEGORIES.map((c) => c.key)).toEqual([
				"overall",
				"flavor",
				"texture",
				"smell",
				"process"
			]);
		});
	});
});
