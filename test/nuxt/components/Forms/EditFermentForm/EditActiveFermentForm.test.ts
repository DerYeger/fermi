import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import EditActiveFermentForm from "~/components/Forms/EditFermentForm/EditActiveFermentForm.vue";

// Mock form field components
vi.mock("~/components/Forms/FormFields/NameFormField.vue", () => ({
	default: { name: "NameFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/ContainerFormField.vue", () => ({
	default: { name: "ContainerFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/ImagesFormField.vue", () => ({
	default: { name: "ImagesFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/SaltRatioFormField.vue", () => ({
	default: { name: "SaltRatioFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/IngredientsFormField.vue", () => ({
	default: { name: "IngredientsFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/DateFormFields.vue", () => ({
	default: { name: "DateFormFields", props: ["startDate", "endDate", "isEndDateRequired"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/NotesFormField.vue", () => ({
	default: { name: "NotesFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FermentFormActions.vue", () => ({
	default: { name: "FermentFormActions", props: ["submitLabel"], emits: ["cancel"], template: "<div></div>" }
}));

// Mock composables and schema
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useFermentContainers: () => [],
		useToast: () => ({
			add: vi.fn()
		}),
		isStartDateUnavailable: () => false,
		isEndDateUnavailable: () => false,
		useFermentIngredients: () => [],
		useIngredientNames: () => ({ value: [] }),
		useIngredientUnits: () => ({ value: [] }),
		createId: () => "test-id"
	};
});

vi.mock("~/types/ferment", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual
	};
});

vi.mock("~/types/utils", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual
	};
});

describe("components/Forms/EditFermentForm/EditActiveFermentForm", () => {
	const activeFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Test Ferment",
		state: "active" as const,
		startDate: "2024-01-01",
		endDate: null,
		saltRatio: 0.02,
		container: "Jar",
		ingredients: [{ id: "ing-1", name: "Cabbage", quantity: 1000, unit: "g" }],
		images: [],
		isFavorite: false,
		notes: "Test notes",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z"
	};

	it("renders UForm component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const form = wrapper.findComponent({ name: "UForm" });
		expect(form.exists()).toBe(true);
	});

	it("renders NameFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "NameFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders ContainerFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "ContainerFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders ImagesFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "ImagesFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders SaltRatioFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "SaltRatioFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders IngredientsFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "IngredientsFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders DateFormFields component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "DateFormFields" });
		expect(field.exists()).toBe(true);
	});

	it("renders NotesFormField component", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const field = wrapper.findComponent({ name: "NotesFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders FermentFormActions with default Update submit label", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.exists()).toBe(true);
		expect(actions.props("submitLabel")).toBe("Update");
	});

	it("renders FermentFormActions with custom submit label", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment, submitLabel: "Save Changes" }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.props("submitLabel")).toBe("Save Changes");
	});

	it("emits cancel event when FermentFormActions emits cancel", async () => {
		const wrapper = await mountSuspended(EditActiveFermentForm, {
			props: { ferment: activeFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		await actions.vm.$emit("cancel");
		expect(wrapper.emitted("cancel")).toBeTruthy();
	});
});
