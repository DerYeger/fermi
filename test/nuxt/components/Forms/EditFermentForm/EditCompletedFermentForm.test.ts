import type { CompletedFerment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import EditCompletedFermentForm from "~/components/Forms/EditFermentForm/EditCompletedFermentForm.vue";
import { BASE_COMPLETED_FERMENT, COMPLETED_FERMENT_WITH_DATA } from "../../../../data";
import { FermentFormActionsStub } from "../../../stubs";

describe("components/Forms/EditFermentForm/EditCompletedFermentForm", () => {
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
				RatingFormFields: true,
				FermentFormActions: FermentFormActionsStub
			}
		}
	};

	describe("rendering", () => {
		it("renders UForm with all form field components including RatingFormFields for all categories", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
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

			// Should render 5 RatingFormFields (one for each category)
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });
			expect(ratingFields.length).toBe(5);
		});

		it("renders FermentFormActions with default Update submit label", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Update");
		});

		it("renders FermentFormActions with custom submit label", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA, submitLabel: "Save" },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Save");
		});
	});

	describe("initial state from ferment prop", () => {
		it("initializes form fields with ferment data", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe(COMPLETED_FERMENT_WITH_DATA.name);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBe(COMPLETED_FERMENT_WITH_DATA.container);
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).props("modelValue")).toBe(COMPLETED_FERMENT_WITH_DATA.saltRatio);
			expect(wrapper.findComponent({ name: "NotesFormField" }).props("modelValue")).toBe(COMPLETED_FERMENT_WITH_DATA.notes);
		});

		it("initializes DateFormFields with isEndDateRequired prop", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const dateFields = wrapper.findComponent({ name: "DateFormFields" });

			expect(dateFields.props("startDate")).toBe(COMPLETED_FERMENT_WITH_DATA.startDate);
			expect(dateFields.props("endDate")).toBe(COMPLETED_FERMENT_WITH_DATA.endDate);
			// Boolean prop passed without value results in empty string or true
			expect(dateFields.props("isEndDateRequired")).toBeDefined();
		});

		it("initializes RatingFormFields with ferment ratings", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });

			// Find overall rating field and verify props
			const overallField = ratingFields.find((f) => f.props("name") === "overall");
			expect(overallField?.props("stars")).toBe(COMPLETED_FERMENT_WITH_DATA.overall.stars);
			expect(overallField?.props("label")).toBe("Overall");

			// Find flavor rating field
			const flavorField = ratingFields.find((f) => f.props("name") === "flavor");
			expect(flavorField?.props("stars")).toBe(COMPLETED_FERMENT_WITH_DATA.flavor.stars);
			expect(flavorField?.props("notes")).toBe(COMPLETED_FERMENT_WITH_DATA.flavor.notes);
		});

		it("handles ferment with minimal ratings", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: BASE_COMPLETED_FERMENT },
				...mountOptions
			});
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });

			const overallField = ratingFields.find((f) => f.props("name") === "overall");
			expect(overallField?.props("stars")).toBeNull();
			expect(overallField?.props("notes")).toBe("");
		});

		it("creates a deep clone of ferment data (does not mutate original)", async () => {
			const fermentCopy = { ...COMPLETED_FERMENT_WITH_DATA };
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: fermentCopy },
				...mountOptions
			});
			const nameField = wrapper.findComponent({ name: "NameFormField" });

			await nameField.vm.$emit("update:modelValue", "Modified Name");
			await nextTick();

			// Original ferment should not be modified
			expect(fermentCopy.name).toBe(COMPLETED_FERMENT_WITH_DATA.name);
			// Form state should be updated
			expect(nameField.props("modelValue")).toBe("Modified Name");
		});
	});

	describe("form field updates", () => {
		it("updates state when form fields emit updates", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});

			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Updated Ferment");
			await nextTick();
			expect(nameField.props("modelValue")).toBe("Updated Ferment");
		});

		it("updates rating fields when RatingFormFields emits updates", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });
			const overallField = ratingFields.find((f) => f.props("name") === "overall");

			await overallField?.vm.$emit("update:stars", 5);
			await nextTick();
			expect(overallField?.props("stars")).toBe(5);

			await overallField?.vm.$emit("update:notes", "Amazing!");
			await nextTick();
			expect(overallField?.props("notes")).toBe("Amazing!");
		});
	});

	describe("cancel event", () => {
		it("emits cancel event when FermentFormActions emits cancel", async () => {
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
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
			const wrapper = await mountSuspended(EditCompletedFermentForm, {
				props: { ferment: COMPLETED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const form = wrapper.findComponent({ name: "UForm" });

			const updatedFerment: CompletedFerment = {
				...COMPLETED_FERMENT_WITH_DATA,
				name: "Updated Ferment Name",
				overall: { stars: 5, notes: "Perfect!" }
			};

			await form.vm.$emit("submit", { data: updatedFerment });

			expect(wrapper.emitted("submit")).toBeTruthy();
			expect(wrapper.emitted("submit")?.[0]).toEqual([updatedFerment]);
		});
	});
});
