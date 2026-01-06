import type {
	ActiveFerment,
	CompletedFerment,
	FailedFerment,
	FermentImage,
	Ingredient,
	Rating
} from "~/types/ferment";

// ==================== Helper Functions ====================

export function createIngredient(
	id: string,
	name: string,
	quantity = 100,
	unit = "g"
): Ingredient {
	return { id, name, quantity, unit };
}

export function createImage(
	id: string,
	base64: string,
	date: string
): FermentImage {
	return { id, base64, date };
}

export function createRating(stars: number | null = null, notes = ""): Rating {
	return { stars, notes };
}

// ==================== Sample Ingredients ====================

export const INGREDIENTS = {
	cabbage: createIngredient("ing-1", "Cabbage", 500, "g"),
	carrots: createIngredient("ing-2", "Carrots", 200, "g"),
	garlic: createIngredient("ing-3", "Garlic", 20, "g"),
	salt: createIngredient("ing-4", "Salt", 12.5, "g"),
	onion: createIngredient("ing-5", "Onion", 100, "g"),
	peppers: createIngredient("ing-6", "Peppers", 150, "g")
} as const;

// ==================== Sample Images ====================

export const IMAGES = {
	day1: createImage("img-1", "data:image/png;base64,day1image", "2024-01-05"),
	day7: createImage("img-2", "data:image/png;base64,day7image", "2024-01-12"),
	day14: createImage("img-3", "data:image/png;base64,day14image", "2024-01-19")
} as const;

// ==================== Sample Ratings ====================

export const RATINGS = {
	excellent: createRating(5, "Excellent"),
	good: createRating(4, "Good quality"),
	average: createRating(3, ""),
	poor: createRating(2, "Needs improvement"),
	empty: createRating(null, "")
} as const;

// ==================== Base Ferments ====================

/**
 * Base active ferment with minimal data (empty arrays for ingredients/images).
 * Use for tests that don't need ingredients or images.
 */
export const BASE_ACTIVE_FERMENT: ActiveFerment = {
	version: 1,
	id: "test-active-1",
	name: "Test Active Ferment",
	state: "active",
	startDate: "2024-01-01",
	endDate: null,
	saltRatio: 0.02,
	container: null,
	ingredients: [],
	images: [],
	isFavorite: false,
	notes: "",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-01T00:00:00Z"
};

/**
 * Active ferment with end date set in the future.
 */
export const ACTIVE_FERMENT_WITH_END_DATE: ActiveFerment = {
	...BASE_ACTIVE_FERMENT,
	id: "test-active-2",
	name: "Ferment With End Date",
	endDate: "2024-02-01"
};

/**
 * Active ferment that is overdue (end date is 2024-01-10, before typical mock date of 2024-01-15 or 2024-01-20).
 */
export const OVERDUE_FERMENT: ActiveFerment = {
	...BASE_ACTIVE_FERMENT,
	id: "test-overdue",
	name: "Overdue Ferment",
	endDate: "2024-01-10"
};

/**
 * Active ferment with ingredients and images populated.
 */
export const ACTIVE_FERMENT_WITH_DATA: ActiveFerment = {
	...BASE_ACTIVE_FERMENT,
	id: "test-active-full",
	name: "Active Ferment With Data",
	container: "Mason Jar",
	ingredients: [INGREDIENTS.cabbage, INGREDIENTS.salt],
	images: [IMAGES.day1],
	isFavorite: true,
	notes: "Test notes for active ferment",
	endDate: "2024-02-01"
};

/**
 * Active ferment with multiple ingredients (for testing overflow badges).
 */
export const ACTIVE_FERMENT_MANY_INGREDIENTS: ActiveFerment = {
	...BASE_ACTIVE_FERMENT,
	id: "test-active-many-ing",
	name: "Ferment With Many Ingredients",
	ingredients: [
		INGREDIENTS.cabbage,
		INGREDIENTS.carrots,
		INGREDIENTS.garlic,
		INGREDIENTS.onion,
		INGREDIENTS.peppers
	]
};

/**
 * Active ferment marked as favorite.
 */
export const FAVORITE_ACTIVE_FERMENT: ActiveFerment = {
	...BASE_ACTIVE_FERMENT,
	id: "test-active-favorite",
	name: "Favorite Ferment",
	isFavorite: true
};

// ==================== Completed Ferments ====================

/**
 * Base completed ferment with minimal data.
 */
export const BASE_COMPLETED_FERMENT: CompletedFerment = {
	version: 1,
	id: "test-completed-1",
	name: "Test Completed Ferment",
	state: "completed",
	startDate: "2024-01-01",
	endDate: "2024-01-15",
	saltRatio: 0.02,
	container: null,
	ingredients: [],
	images: [],
	isFavorite: false,
	notes: "",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-15T00:00:00Z",
	overall: RATINGS.empty,
	flavor: RATINGS.empty,
	texture: RATINGS.empty,
	smell: RATINGS.empty,
	process: RATINGS.empty
};

/**
 * Completed ferment with all ratings filled.
 */
export const COMPLETED_FERMENT_WITH_RATINGS: CompletedFerment = {
	...BASE_COMPLETED_FERMENT,
	id: "test-completed-rated",
	name: "Completed Ferment With Ratings",
	overall: RATINGS.excellent,
	flavor: RATINGS.good,
	texture: RATINGS.excellent,
	smell: RATINGS.good,
	process: RATINGS.excellent
};

/**
 * Completed ferment with all data populated.
 */
export const COMPLETED_FERMENT_WITH_DATA: CompletedFerment = {
	...BASE_COMPLETED_FERMENT,
	id: "test-completed-full",
	name: "Completed Ferment With Data",
	container: "Crock Pot",
	ingredients: [INGREDIENTS.cabbage, INGREDIENTS.carrots],
	images: [IMAGES.day1, IMAGES.day14],
	notes: "Great fermentation process",
	overall: RATINGS.excellent,
	flavor: RATINGS.good,
	texture: RATINGS.excellent,
	smell: RATINGS.good,
	process: RATINGS.excellent
};

// ==================== Failed Ferments ====================

/**
 * Base failed ferment with minimal data.
 */
export const BASE_FAILED_FERMENT: FailedFerment = {
	version: 1,
	id: "test-failed-1",
	name: "Test Failed Ferment",
	state: "failed",
	startDate: "2024-01-01",
	endDate: "2024-01-10",
	saltRatio: 0.015,
	container: null,
	ingredients: [],
	images: [],
	isFavorite: false,
	notes: "",
	createdAt: "2024-01-01T00:00:00Z",
	updatedAt: "2024-01-10T00:00:00Z",
	reason: "Mold developed on surface"
};

/**
 * Failed ferment without a reason.
 */
export const FAILED_FERMENT_NO_REASON: FailedFerment = {
	...BASE_FAILED_FERMENT,
	id: "test-failed-no-reason",
	name: "Failed Ferment Without Reason",
	reason: ""
};

/**
 * Failed ferment with full data.
 */
export const FAILED_FERMENT_WITH_DATA: FailedFerment = {
	...BASE_FAILED_FERMENT,
	id: "test-failed-full",
	name: "Failed Ferment With Data",
	container: "Glass Jar",
	ingredients: [INGREDIENTS.cabbage, INGREDIENTS.garlic],
	images: [IMAGES.day1],
	notes: "Tried new technique",
	reason: "Kahm yeast contamination"
};
