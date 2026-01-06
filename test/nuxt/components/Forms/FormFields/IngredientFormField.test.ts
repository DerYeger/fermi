import type { InputMenuItem } from "@nuxt/ui";
import type { Ingredient } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import IngredientFormField from "~/components/Forms/FormFields/IngredientFormField.vue";
import { UInputMenuStub, UInputNumberStub } from "../../../stubs";

describe("components/Forms/FormFields/IngredientFormField", () => {
	const defaultIngredient: Ingredient = {
		id: "ing-1",
		name: "",
		quantity: 0,
		unit: ""
	};

	const filledIngredient: Ingredient = {
		id: "ing-2",
		name: "Cabbage",
		quantity: 500,
		unit: "g"
	};

	const ingredientNames = ["Cabbage", "Salt", "Garlic"];
	const unitItems: InputMenuItem[] = [
		{ type: "label", label: "Metric" },
		{ type: "item", label: "g", value: "g" },
		{ type: "item", label: "kg", value: "kg" }
	];

	function mountComponent(options: { ingredient?: Ingredient, index?: number, wasIngredientAdded?: boolean } = {}) {
		const { ingredient = defaultIngredient, index = 0, wasIngredientAdded = false } = options;
		return mountSuspended(IngredientFormField, {
			props: {
				modelValue: ingredient,
				index,
				ingredientNames,
				unitItems,
				wasIngredientAdded
			},
			global: {
				stubs: {
					UInputMenu: UInputMenuStub,
					UInputNumber: UInputNumberStub
				}
			}
		});
	}

	describe("rendering", () => {
		it("renders three UFormField components for name, quantity, and unit", async () => {
			const wrapper = await mountComponent();
			const formFields = wrapper.findAllComponents({ name: "UFormField" });
			expect(formFields).toHaveLength(3);
		});

		it("renders UFormField for name with correct name prop", async () => {
			const wrapper = await mountComponent({ index: 2 });
			const formFields = wrapper.findAllComponents({ name: "UFormField" });
			expect(formFields[0]!.props("name")).toBe("ingredients.2.name");
		});

		it("renders UFormField for quantity with correct name prop", async () => {
			const wrapper = await mountComponent({ index: 1 });
			const formFields = wrapper.findAllComponents({ name: "UFormField" });
			expect(formFields[1]!.props("name")).toBe("ingredients.1.quantity");
		});

		it("renders UFormField for unit with correct name prop", async () => {
			const wrapper = await mountComponent({ index: 0 });
			const formFields = wrapper.findAllComponents({ name: "UFormField" });
			expect(formFields[2]!.props("name")).toBe("ingredients.0.unit");
		});

		it("renders UInputMenu for name field", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus.length).toBeGreaterThanOrEqual(1);
		});

		it("renders UInputNumber for quantity field", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.exists()).toBe(true);
		});

		it("renders delete button with correct props", async () => {
			const wrapper = await mountComponent();
			const deleteButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			expect(deleteButton).toBeDefined();
			expect(deleteButton?.props("color")).toBe("error");
			expect(deleteButton?.props("variant")).toBe("subtle");
		});
	});

	describe("empty state", () => {
		it("displays empty name when ingredient name is empty", async () => {
			const wrapper = await mountComponent({ ingredient: defaultIngredient });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("modelValue")).toBe("");
		});

		it("displays zero quantity when ingredient quantity is 0", async () => {
			const wrapper = await mountComponent({ ingredient: defaultIngredient });
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("modelValue")).toBe(0);
		});

		it("displays empty unit when ingredient unit is empty", async () => {
			const wrapper = await mountComponent({ ingredient: defaultIngredient });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[1]!.props("modelValue")).toBe("");
		});
	});

	describe("filled state", () => {
		it("displays the ingredient name", async () => {
			const wrapper = await mountComponent({ ingredient: filledIngredient });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("modelValue")).toBe("Cabbage");
		});

		it("displays the ingredient quantity", async () => {
			const wrapper = await mountComponent({ ingredient: filledIngredient });
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("modelValue")).toBe(500);
		});

		it("displays the ingredient unit", async () => {
			const wrapper = await mountComponent({ ingredient: filledIngredient });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[1]!.props("modelValue")).toBe("g");
		});
	});

	describe("props", () => {
		it("passes ingredientNames to the name UInputMenu", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("items")).toEqual(ingredientNames);
		});

		it("passes unitItems to the unit UInputMenu", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[1]!.props("items")).toEqual(unitItems);
		});

		it("enables autofocus when wasIngredientAdded is true", async () => {
			const wrapper = await mountComponent({ wasIngredientAdded: true });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("autofocus")).toBe(true);
		});

		it("disables autofocus when wasIngredientAdded is false", async () => {
			const wrapper = await mountComponent({ wasIngredientAdded: false });
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("autofocus")).toBe(false);
		});

		it("uInputNumber has min set to 0", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("min")).toBe(0);
		});

		it("name UInputMenu has create-item enabled", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			// create-item boolean prop without value becomes "" or true depending on rendering
			expect(inputMenus[0]!.props("createItem")).toBeDefined();
		});

		it("unit UInputMenu has create-item enabled", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			// create-item boolean prop without value becomes "" or true depending on rendering
			expect(inputMenus[1]!.props("createItem")).toBeDefined();
		});

		it("uInputNumber has step set to 0.01", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("step")).toBe(0.01);
		});

		it("uInputNumber has increment disabled", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("increment")).toBe(false);
		});

		it("uInputNumber has decrement disabled", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("decrement")).toBe(false);
		});
	});

	describe("placeholders", () => {
		it("name UInputMenu has placeholder", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[0]!.props("placeholder")).toBe("Name...");
		});

		it("quantity UInputNumber has placeholder", async () => {
			const wrapper = await mountComponent();
			const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
			expect(inputNumber.props("placeholder")).toBe("Quantity...");
		});

		it("unit UInputMenu has placeholder", async () => {
			const wrapper = await mountComponent();
			const inputMenus = wrapper.findAllComponents({ name: "UInputMenu" });
			expect(inputMenus[1]!.props("placeholder")).toBe("Unit...");
		});
	});

	describe("delete button", () => {
		it("emits remove event when delete button is clicked", async () => {
			const wrapper = await mountComponent();
			const deleteButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			await deleteButton?.vm.$emit("click");
			expect(wrapper.emitted("remove")).toHaveLength(1);
		});
	});

	describe("name input interactions", () => {
		it("updates ingredient name via onCreateName when UInputMenu emits create event", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			await nameInput.vm.$emit("create", "  New Ingredient  ");
			expect(ingredient.name).toBe("New Ingredient");
		});

		it("trims whitespace from created name", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			await nameInput.vm.$emit("create", "   Cabbage   ");
			expect(ingredient.name).toBe("Cabbage");
		});

		it("sets name from search term on blur when name is empty", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, name: "" };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			// Simulate typing in the search field
			await nameInput.vm.$emit("update:search-term", "  Garlic  ");
			await nameInput.vm.$emit("blur");
			expect(ingredient.name).toBe("Garlic");
		});

		it("does not override existing name on blur", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, name: "Cabbage" };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			await nameInput.vm.$emit("update:search-term", "Garlic");
			await nameInput.vm.$emit("blur");
			expect(ingredient.name).toBe("Cabbage");
		});

		it("does not set name on blur when search term is empty", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, name: "" };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			await nameInput.vm.$emit("update:search-term", "   ");
			await nameInput.vm.$emit("blur");
			expect(ingredient.name).toBe("");
		});

		it("closes name dropdown on blur", async () => {
			const wrapper = await mountComponent();
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			// First open it
			await nameInput.vm.$emit("update:open", true);
			// Then blur
			await nameInput.vm.$emit("blur");
			// The component should have closed the dropdown
			expect(nameInput.props("open")).toBe(false);
		});
	});

	describe("unit input interactions", () => {
		it("updates ingredient unit via onCreateUnit when UInputMenu emits create event", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("create", "  heads  ");
			expect(ingredient.unit).toBe("heads");
		});

		it("trims whitespace from created unit", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("create", "   bunches   ");
			expect(ingredient.unit).toBe("bunches");
		});

		it("sets unit from search term on blur when unit is empty", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, unit: "" };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("update:search-term", "  cloves  ");
			await unitInput.vm.$emit("blur");
			expect(ingredient.unit).toBe("cloves");
		});

		it("does not override existing unit on blur", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, unit: "g" };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("update:search-term", "kg");
			await unitInput.vm.$emit("blur");
			expect(ingredient.unit).toBe("g");
		});

		it("does not set unit on blur when search term is empty", async () => {
			const ingredient: Ingredient = { ...defaultIngredient, unit: "" };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("update:search-term", "   ");
			await unitInput.vm.$emit("blur");
			expect(ingredient.unit).toBe("");
		});

		it("closes unit dropdown on blur", async () => {
			const wrapper = await mountComponent();
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			// First open it
			await unitInput.vm.$emit("update:open", true);
			// Then blur
			await unitInput.vm.$emit("blur");
			// The component should have closed the dropdown
			expect(unitInput.props("open")).toBe(false);
		});
	});

	describe("model value updates", () => {
		it("updates name via v-model", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const nameInput = wrapper.findAllComponents({ name: "UInputMenu" })[0]!;
			await nameInput.vm.$emit("update:model-value", "Salt");
			expect(ingredient.name).toBe("Salt");
		});

		it("updates unit via v-model", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const unitInput = wrapper.findAllComponents({ name: "UInputMenu" })[1]!;
			await unitInput.vm.$emit("update:model-value", "kg");
			expect(ingredient.unit).toBe("kg");
		});

		it("updates quantity via v-model", async () => {
			const ingredient: Ingredient = { ...defaultIngredient };
			const wrapper = await mountComponent({ ingredient });
			const quantityInput = wrapper.findComponent({ name: "UInputNumber" });
			await quantityInput.vm.$emit("update:model-value", 250);
			expect(ingredient.quantity).toBe(250);
		});
	});
});
