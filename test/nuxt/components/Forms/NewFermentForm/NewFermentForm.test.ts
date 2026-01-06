import type { ActiveFerment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import NewFermentForm from "~/components/Forms/NewFermentForm/NewFermentForm.vue";
import { FermentFormActionsStub } from "../../../stubs";

// Mock composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		createId: () => "test-generated-id",
		getISODatetime: () => "2024-01-15T10:00:00Z"
	};
});

vi.mock("~/composables/time", () => ({
	getISODate: () => "2024-01-15",
	getISODatetime: () => "2024-01-15T10:00:00Z"
}));

describe("components/Forms/NewFermentForm/NewFermentForm", () => {
	const mountOptions = {
		global: {
			stubs: {
				NameFormField: true,
				ContainerFormField: true,
				ImagesFormField: true,
				SaltRatioFormField: true,
				IngredientsFormField: true,
				DateFormFields: true,
				NotesFormField: true,
				FermentFormActions: FermentFormActionsStub
			}
		}
	};

	describe("rendering", () => {
		it("renders UForm with all form field components and FermentFormActions with Create label", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);

			expect(wrapper.findComponent({ name: "UForm" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "NameFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "ImagesFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "DateFormFields" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "NotesFormField" }).exists()).toBe(true);
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.exists()).toBe(true);
			expect(actions.props("submitLabel")).toBe("Create");
		});
	});

	describe("initial state", () => {
		it("initializes with correct default values", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe("");
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBe("");
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).props("modelValue")).toBe(0.02);
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).props("modelValue")).toEqual([]);
			expect(wrapper.findComponent({ name: "ImagesFormField" }).props("modelValue")).toEqual([]);
			expect(wrapper.findComponent({ name: "NotesFormField" }).props("modelValue")).toBe("");
		});

		it("initializes date fields with today as start date and null end date", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);
			const dateFields = wrapper.findComponent({ name: "DateFormFields" });

			expect(dateFields.props("startDate")).toBe("2024-01-15");
			expect(dateFields.props("endDate")).toBeNull();
		});
	});

	describe("form field updates", () => {
		it("updates state when form fields emit updates", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);

			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Kimchi");
			await nextTick();
			expect(nameField.props("modelValue")).toBe("Kimchi");

			const containerField = wrapper.findComponent({ name: "ContainerFormField" });
			await containerField.vm.$emit("update:modelValue", "Mason Jar");
			await nextTick();
			expect(containerField.props("modelValue")).toBe("Mason Jar");

			const saltField = wrapper.findComponent({ name: "SaltRatioFormField" });
			await saltField.vm.$emit("update:modelValue", 0.03);
			await nextTick();
			expect(saltField.props("modelValue")).toBe(0.03);

			const notesField = wrapper.findComponent({ name: "NotesFormField" });
			await notesField.vm.$emit("update:modelValue", "Test notes");
			await nextTick();
			expect(notesField.props("modelValue")).toBe("Test notes");
		});

		it("updates date fields when DateFormFields emits updates", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);
			const dateFields = wrapper.findComponent({ name: "DateFormFields" });

			await dateFields.vm.$emit("update:startDate", "2024-02-01");
			await nextTick();
			expect(dateFields.props("startDate")).toBe("2024-02-01");

			await dateFields.vm.$emit("update:endDate", "2024-02-15");
			await nextTick();
			expect(dateFields.props("endDate")).toBe("2024-02-15");
		});
	});

	describe("cancel event", () => {
		it("emits cancel event when FermentFormActions emits cancel", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);
			const actions = wrapper.findComponent({ name: "FermentFormActions" });

			await actions.vm.$emit("cancel");

			expect(wrapper.emitted("cancel")).toBeTruthy();
			expect(wrapper.emitted("cancel")).toHaveLength(1);
		});
	});

	describe("form submission", () => {
		it("emits submit event with ferment data when form is submitted", async () => {
			const wrapper = await mountSuspended(NewFermentForm, mountOptions);
			const form = wrapper.findComponent({ name: "UForm" });

			// Simulate field updates
			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Test Ferment");
			await nextTick();

			// Trigger form submit with the expected data
			const fermentData: ActiveFerment = {
				version: 1,
				id: "test-generated-id",
				name: "Test Ferment",
				container: "",
				images: [],
				ingredients: [],
				saltRatio: 0.02,
				notes: "",
				startDate: "2024-01-15",
				endDate: null,
				createdAt: "2024-01-15T10:00:00Z",
				updatedAt: "2024-01-15T10:00:00Z",
				state: "active",
				isFavorite: false
			};

			await form.vm.$emit("submit", { data: fermentData });

			expect(wrapper.emitted("submit")).toBeTruthy();
			expect(wrapper.emitted("submit")?.[0]).toEqual([fermentData]);
		});
	});
});
