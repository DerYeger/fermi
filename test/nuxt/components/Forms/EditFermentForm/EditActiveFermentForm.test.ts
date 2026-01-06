import type { ActiveFerment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import EditActiveFermentForm from "~/components/Forms/EditFermentForm/EditActiveFermentForm.vue";
import { ACTIVE_FERMENT_WITH_DATA, BASE_ACTIVE_FERMENT } from "../../../../data";
import { FermentFormActionsStub } from "../../../stubs";

describe("components/Forms/EditFermentForm/EditActiveFermentForm", () => {
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
		it("renders UForm with all form field components", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "UForm" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "NameFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "ImagesFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "DateFormFields" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "NotesFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "FermentFormActions" }).exists()).toBe(true);
		});

		it("renders FermentFormActions with default Update submit label", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Update");
		});

		it("renders FermentFormActions with custom submit label", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA, submitLabel: "Save Changes" },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Save Changes");
		});
	});

	describe("initial state from ferment prop", () => {
		it("initializes form fields with ferment data", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe(ACTIVE_FERMENT_WITH_DATA.name);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBe(ACTIVE_FERMENT_WITH_DATA.container);
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).props("modelValue")).toBe(ACTIVE_FERMENT_WITH_DATA.saltRatio);
			expect(wrapper.findComponent({ name: "NotesFormField" }).props("modelValue")).toBe(ACTIVE_FERMENT_WITH_DATA.notes);
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).props("modelValue")).toEqual(ACTIVE_FERMENT_WITH_DATA.ingredients);
			expect(wrapper.findComponent({ name: "ImagesFormField" }).props("modelValue")).toEqual(ACTIVE_FERMENT_WITH_DATA.images);
		});

		it("initializes date fields with ferment dates", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});
			const dateFields = wrapper.findComponent({ name: "DateFormFields" });

			expect(dateFields.props("startDate")).toBe(ACTIVE_FERMENT_WITH_DATA.startDate);
			expect(dateFields.props("endDate")).toBe(ACTIVE_FERMENT_WITH_DATA.endDate);
		});

		it("handles ferment with minimal data", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: BASE_ACTIVE_FERMENT },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe(BASE_ACTIVE_FERMENT.name);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBeNull();
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).props("modelValue")).toEqual([]);
			expect(wrapper.findComponent({ name: "ImagesFormField" }).props("modelValue")).toEqual([]);
		});

		it("creates a deep clone of ferment data (does not mutate original)", async () => {
			const fermentCopy = { ...ACTIVE_FERMENT_WITH_DATA };
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: fermentCopy },
				...mountOptions
			});
			const nameField = wrapper.findComponent({ name: "NameFormField" });

			await nameField.vm.$emit("update:modelValue", "Modified Name");
			await nextTick();

			// Original ferment should not be modified
			expect(fermentCopy.name).toBe(ACTIVE_FERMENT_WITH_DATA.name);
			// Form state should be updated
			expect(nameField.props("modelValue")).toBe("Modified Name");
		});
	});

	describe("form field updates", () => {
		it("updates state when form fields emit updates", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});

			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Updated Ferment");
			await nextTick();
			expect(nameField.props("modelValue")).toBe("Updated Ferment");

			const saltField = wrapper.findComponent({ name: "SaltRatioFormField" });
			await saltField.vm.$emit("update:modelValue", 0.05);
			await nextTick();
			expect(saltField.props("modelValue")).toBe(0.05);
		});

		it("updates date fields when DateFormFields emits updates", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});
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
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });

			await actions.vm.$emit("cancel");

			expect(wrapper.emitted("cancel")).toBeTruthy();
			expect(wrapper.emitted("cancel")).toHaveLength(1);
		});
	});

	describe("form submission", () => {
		it("emits submit event with updated ferment data when form is submitted", async () => {
			const wrapper = await mountSuspended(EditActiveFermentForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA },
				...mountOptions
			});
			const form = wrapper.findComponent({ name: "UForm" });

			// Simulate field update
			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Updated Ferment Name");
			await nextTick();

			// Trigger form submit with updated data
			const updatedFerment: ActiveFerment = {
				...ACTIVE_FERMENT_WITH_DATA,
				name: "Updated Ferment Name"
			};

			await form.vm.$emit("submit", { data: updatedFerment });

			expect(wrapper.emitted("submit")).toBeTruthy();
			expect(wrapper.emitted("submit")?.[0]).toEqual([updatedFerment]);
		});
	});
});
