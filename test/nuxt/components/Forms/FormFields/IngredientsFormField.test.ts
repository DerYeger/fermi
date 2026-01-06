import type { Ingredient } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import IngredientFormField from "~/components/Forms/FormFields/IngredientFormField.vue";
import IngredientsFormField from "~/components/Forms/FormFields/IngredientsFormField.vue";

// Mock composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useIngredientNames: () => computed(() => ["Cabbage", "Salt", "Garlic"]),
		useIngredientUnits: () => computed(() => ["custom-unit"]),
		createId: () => "new-id"
	};
});

describe("components/Forms/FormFields/IngredientsFormField", () => {
	const emptyIngredients: Ingredient[] = [];

	const singleIngredient: Ingredient[] = [
		{ id: "ing-1", name: "Cabbage", quantity: 500, unit: "g" }
	];

	const multipleIngredients: Ingredient[] = [
		{ id: "ing-1", name: "Cabbage", quantity: 500, unit: "g" },
		{ id: "ing-2", name: "Salt", quantity: 15, unit: "g" },
		{ id: "ing-3", name: "Garlic", quantity: 3, unit: "pieces" }
	];

	function mountComponent(ingredients: Ingredient[] = emptyIngredients) {
		return mountSuspended(IngredientsFormField, {
			props: {
				modelValue: ingredients
			},
			global: {
				stubs: {
					IngredientFormField: false
				}
			}
		});
	}

	describe("rendering", () => {
		it("renders UFormField with correct label and name", async () => {
			const wrapper = await mountComponent();
			const formField = wrapper.findComponent({ name: "UFormField" });
			expect(formField.exists()).toBe(true);
			expect(formField.props("label")).toBe("Ingredients");
			expect(formField.props("name")).toBe("ingredients");
		});

		it("renders add ingredient button with correct props", async () => {
			const wrapper = await mountComponent();
			const addButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:plus-sign"
			);
			expect(addButton).toBeDefined();
			expect(addButton?.props("label")).toBe("Add ingredient");
			expect(addButton?.props("variant")).toBe("subtle");
		});
	});

	describe("empty state", () => {
		it("renders no IngredientFormField components when ingredients array is empty", async () => {
			const wrapper = await mountComponent(emptyIngredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			expect(ingredientFields).toHaveLength(0);
		});

		it("only shows the add ingredient button when empty", async () => {
			const wrapper = await mountComponent(emptyIngredients);
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			expect(buttons).toHaveLength(1);
			expect(buttons[0]!.props("icon")).toBe("hugeicons:plus-sign");
		});
	});

	describe("with ingredients", () => {
		it("renders one IngredientFormField for single ingredient", async () => {
			const wrapper = await mountComponent(singleIngredient);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			expect(ingredientFields).toHaveLength(1);
		});

		it("renders multiple IngredientFormField components for multiple ingredients", async () => {
			const wrapper = await mountComponent(multipleIngredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			expect(ingredientFields).toHaveLength(3);
		});

		it("passes correct modelValue to each IngredientFormField", async () => {
			const wrapper = await mountComponent(multipleIngredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			expect(ingredientFields[0]!.props("modelValue")).toEqual(multipleIngredients[0]);
			expect(ingredientFields[1]!.props("modelValue")).toEqual(multipleIngredients[1]);
			expect(ingredientFields[2]!.props("modelValue")).toEqual(multipleIngredients[2]);
		});

		it("passes correct index to each IngredientFormField", async () => {
			const wrapper = await mountComponent(multipleIngredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			expect(ingredientFields[0]!.props("index")).toBe(0);
			expect(ingredientFields[1]!.props("index")).toBe(1);
			expect(ingredientFields[2]!.props("index")).toBe(2);
		});

		it("passes ingredientNames to IngredientFormField containing drafted names", async () => {
			const wrapper = await mountComponent(singleIngredient);
			const ingredientField = wrapper.findComponent(IngredientFormField);
			// The composable combines drafted names with stored names - we only get "Cabbage" from draft
			expect(ingredientField.props("ingredientNames")).toContain("Cabbage");
		});

		it("passes unitItems array to IngredientFormField", async () => {
			const wrapper = await mountComponent(singleIngredient);
			const ingredientField = wrapper.findComponent(IngredientFormField);
			expect(ingredientField.props("unitItems")).toBeDefined();
			expect(Array.isArray(ingredientField.props("unitItems"))).toBe(true);
		});

		it("adds more buttons when ingredients exist (add button plus delete buttons)", async () => {
			const wrapper = await mountComponent(multipleIngredients);
			const addButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:plus-sign"
			);
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			expect(addButton).toBeDefined();
			expect(deleteButtons).toHaveLength(3);
		});
	});

	describe("addition", () => {
		it("adds ingredient to model when add button is clicked", async () => {
			const ingredients = [...emptyIngredients];
			const wrapper = await mountComponent(ingredients);
			const buttons = wrapper.findAll("button");
			const addButton = buttons.find((btn) => btn.text().includes("Add ingredient"));
			expect(ingredients).toHaveLength(0);
			await addButton?.trigger("click");
			expect(ingredients).toHaveLength(1);
		});

		it("appends new ingredient to existing list", async () => {
			const ingredients = [...singleIngredient];
			const wrapper = await mountComponent(ingredients);
			const buttons = wrapper.findAll("button");
			const addButton = buttons.find((btn) => btn.text().includes("Add ingredient"));
			expect(ingredients).toHaveLength(1);
			await addButton?.trigger("click");
			expect(ingredients).toHaveLength(2);
		});

		it("new ingredient has default empty values", async () => {
			const ingredients: Ingredient[] = [];
			const wrapper = await mountComponent(ingredients);
			const buttons = wrapper.findAll("button");
			const addButton = buttons.find((btn) => btn.text().includes("Add ingredient"));
			await addButton?.trigger("click");
			const newIngredient = ingredients[0]!;
			expect(newIngredient.id).toBeDefined();
			expect(newIngredient.name).toBe("");
			expect(newIngredient.quantity).toBe(0);
			expect(newIngredient.unit).toBe("");
		});
	});

	describe("deletion", () => {
		it("removes ingredient when IngredientFormField emits remove event", async () => {
			const ingredients = [...multipleIngredients];
			const wrapper = await mountComponent(ingredients);
			expect(ingredients).toHaveLength(3);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			await ingredientFields[1]!.vm.$emit("remove");
			expect(ingredients).toHaveLength(2);
		});

		it("removes the first ingredient when first IngredientFormField emits remove", async () => {
			const ingredients = [...multipleIngredients];
			const wrapper = await mountComponent(ingredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			await ingredientFields[0]!.vm.$emit("remove");
			expect(ingredients).toHaveLength(2);
			expect(ingredients[0]!.name).toBe("Salt");
		});

		it("can remove the last remaining ingredient", async () => {
			const ingredients = [...singleIngredient];
			const wrapper = await mountComponent(ingredients);
			expect(ingredients).toHaveLength(1);
			const ingredientField = wrapper.findComponent(IngredientFormField);
			await ingredientField.vm.$emit("remove");
			expect(ingredients).toHaveLength(0);
		});
	});

	describe("editing", () => {
		it("passes updated ingredient back when IngredientFormField emits update", async () => {
			const ingredients = [...singleIngredient];
			const wrapper = await mountComponent(ingredients);
			const ingredientField = wrapper.findComponent(IngredientFormField);
			const updatedIngredient = { ...singleIngredient[0], name: "Updated Cabbage" };
			await ingredientField.vm.$emit("update:modelValue", updatedIngredient);
			expect(ingredients[0]!.name).toBe("Updated Cabbage");
		});

		it("updates correct ingredient by index when editing multiple ingredients", async () => {
			const ingredients = [...multipleIngredients];
			const wrapper = await mountComponent(ingredients);
			const ingredientFields = wrapper.findAllComponents(IngredientFormField);
			const updatedIngredient = { ...multipleIngredients[1], quantity: 30 };
			await ingredientFields[1]!.vm.$emit("update:modelValue", updatedIngredient);
			expect(ingredients[1]!.quantity).toBe(30);
			expect(ingredients[0]!.quantity).toBe(500);
			expect(ingredients[2]!.quantity).toBe(3);
		});
	});
});
