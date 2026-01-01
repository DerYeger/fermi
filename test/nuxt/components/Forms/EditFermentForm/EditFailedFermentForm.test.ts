import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import EditFailedFermentForm from "~/components/Forms/EditFermentForm/EditFailedFermentForm.vue";

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
vi.mock("~/components/Forms/FormFields/DateFormFields.vue", () => ({
	default: { name: "DateFormFields", props: ["startDate", "endDate", "isEndDateRequired"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/FailureReasonFormField.vue", () => ({
	default: { name: "FailureReasonFormField", props: ["modelValue"], template: "<div></div>" }
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

describe("components/Forms/EditFermentForm/EditFailedFermentForm", () => {
	const failedFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Failed Ferment",
		state: "failed" as const,
		startDate: "2024-01-01",
		endDate: "2024-01-15",
		saltRatio: 0.02,
		container: "Jar",
		ingredients: [{ id: "ing-1", name: "Cabbage", quantity: 1000, unit: "g" }],
		images: [],
		isFavorite: false,
		notes: "Test notes",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		reason: "Mold appeared"
	};

	it("renders UForm component", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const form = wrapper.findComponent({ name: "UForm" });
		expect(form.exists()).toBe(true);
	});

	it("renders NameFormField component", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const field = wrapper.findComponent({ name: "NameFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders ContainerFormField component", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const field = wrapper.findComponent({ name: "ContainerFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders FailureReasonFormField component", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const field = wrapper.findComponent({ name: "FailureReasonFormField" });
		expect(field.exists()).toBe(true);
	});

	it("renders DateFormFields with isEndDateRequired prop", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const dateFields = wrapper.findComponent({ name: "DateFormFields" });
		expect(dateFields.exists()).toBe(true);
		// Boolean prop passed without value results in empty string
		expect(dateFields.props("isEndDateRequired")).toBeDefined();
	});

	it("renders FermentFormActions with default Update submit label", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.exists()).toBe(true);
		expect(actions.props("submitLabel")).toBe("Update");
	});

	it("renders FermentFormActions with custom submit label", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment, submitLabel: "Save" }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.props("submitLabel")).toBe("Save");
	});

	it("emits cancel event when FermentFormActions emits cancel", async () => {
		const wrapper = await mountSuspended(EditFailedFermentForm, {
			props: { ferment: failedFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		await actions.vm.$emit("cancel");
		expect(wrapper.emitted("cancel")).toBeTruthy();
	});
});
