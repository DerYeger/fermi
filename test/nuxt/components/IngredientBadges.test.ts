import { IngredientBadges } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { ACTIVE_FERMENT_MANY_INGREDIENTS, createIngredient, INGREDIENTS } from "../../data";

describe("components/IngredientBadges", () => {
	it("renders nothing when ingredients array is empty", async () => {
		const wrapper = await mountSuspended(IngredientBadges, {
			props: { ingredients: [] }
		});
		expect(wrapper.findComponent({ name: "UBadge" }).exists()).toBe(false);
	});

	it("renders single ingredient as UBadge", async () => {
		const wrapper = await mountSuspended(IngredientBadges, {
			props: {
				ingredients: [INGREDIENTS.cabbage]
			}
		});
		const badges = wrapper.findAllComponents({ name: "UBadge" });
		expect(badges).toHaveLength(1);
		expect(badges[0]!.props("variant")).toBe("subtle");
	});

	it("renders multiple ingredients up to limit", async () => {
		const wrapper = await mountSuspended(IngredientBadges, {
			props: {
				ingredients: [
					INGREDIENTS.cabbage,
					INGREDIENTS.carrots,
					INGREDIENTS.garlic
				]
			}
		});
		const badges = wrapper.findAllComponents({ name: "UBadge" });
		expect(badges).toHaveLength(3);
	});

	it("shows overflow badge when exceeding limit of 3", async () => {
		const wrapper = await mountSuspended(IngredientBadges, {
			props: {
				ingredients: ACTIVE_FERMENT_MANY_INGREDIENTS.ingredients
			}
		});
		const badges = wrapper.findAllComponents({ name: "UBadge" });
		// 3 ingredient badges + 1 overflow badge
		expect(badges).toHaveLength(4);
		// Last badge should be neutral color for overflow
		expect(badges[3]!.props("color")).toBe("neutral");
	});

	it("shows correct overflow count", async () => {
		const fourIngredients = [
			createIngredient("1", "A"),
			createIngredient("2", "B"),
			createIngredient("3", "C"),
			createIngredient("4", "D")
		];
		const wrapper = await mountSuspended(IngredientBadges, {
			props: {
				ingredients: fourIngredients
			}
		});
		const badges = wrapper.findAllComponents({ name: "UBadge" });
		// 3 ingredient badges + 1 overflow badge
		expect(badges).toHaveLength(4);
	});
});
