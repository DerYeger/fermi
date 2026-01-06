import type { FailedFerment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { nextTick } from "vue";
import EditFailedFermentForm from "~/components/Forms/EditFermentForm/EditFailedFermentForm.vue";
import { BASE_FAILED_FERMENT, FAILED_FERMENT_NO_REASON, FAILED_FERMENT_WITH_DATA } from "../../../../data";
import { FermentFormActionsStub } from "../../../stubs";

describe("components/Forms/EditFermentForm/EditFailedFermentForm", () => {
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
				FailureReasonFormField: true,
				FermentFormActions: FermentFormActionsStub
			}
		}
	};

	describe("rendering", () => {
		it("renders UForm with all form field components including FailureReasonFormField", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
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
			expect(wrapper.findComponent({ name: "FailureReasonFormField" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "FermentFormActions" }).exists()).toBe(true);
		});

		it("renders FermentFormActions with default Update submit label", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Update");
		});

		it("renders FermentFormActions with custom submit label", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA, submitLabel: "Save" },
				...mountOptions
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.props("submitLabel")).toBe("Save");
		});
	});

	describe("initial state from ferment prop", () => {
		it("initializes form fields with ferment data", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe(FAILED_FERMENT_WITH_DATA.name);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBe(FAILED_FERMENT_WITH_DATA.container);
			expect(wrapper.findComponent({ name: "SaltRatioFormField" }).props("modelValue")).toBe(FAILED_FERMENT_WITH_DATA.saltRatio);
			expect(wrapper.findComponent({ name: "NotesFormField" }).props("modelValue")).toBe(FAILED_FERMENT_WITH_DATA.notes);
		});

		it("initializes DateFormFields with isEndDateRequired prop", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const dateFields = wrapper.findComponent({ name: "DateFormFields" });

			expect(dateFields.props("startDate")).toBe(FAILED_FERMENT_WITH_DATA.startDate);
			expect(dateFields.props("endDate")).toBe(FAILED_FERMENT_WITH_DATA.endDate);
			expect(dateFields.props("isEndDateRequired")).toBeDefined();
		});

		it("initializes FailureReasonFormField with ferment reason", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const reasonField = wrapper.findComponent({ name: "FailureReasonFormField" });

			expect(reasonField.props("modelValue")).toBe(FAILED_FERMENT_WITH_DATA.reason);
		});

		it("handles ferment with minimal data", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: BASE_FAILED_FERMENT },
				...mountOptions
			});

			expect(wrapper.findComponent({ name: "NameFormField" }).props("modelValue")).toBe(BASE_FAILED_FERMENT.name);
			expect(wrapper.findComponent({ name: "ContainerFormField" }).props("modelValue")).toBeNull();
			expect(wrapper.findComponent({ name: "IngredientsFormField" }).props("modelValue")).toEqual([]);
		});

		it("handles ferment without reason", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_NO_REASON },
				...mountOptions
			});
			const reasonField = wrapper.findComponent({ name: "FailureReasonFormField" });

			expect(reasonField.props("modelValue")).toBe("");
		});

		it("creates a deep clone of ferment data (does not mutate original)", async () => {
			const fermentCopy = { ...FAILED_FERMENT_WITH_DATA };
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: fermentCopy },
				...mountOptions
			});
			const nameField = wrapper.findComponent({ name: "NameFormField" });

			await nameField.vm.$emit("update:modelValue", "Modified Name");
			await nextTick();

			// Original ferment should not be modified
			expect(fermentCopy.name).toBe(FAILED_FERMENT_WITH_DATA.name);
			// Form state should be updated
			expect(nameField.props("modelValue")).toBe("Modified Name");
		});
	});

	describe("form field updates", () => {
		it("updates state when form fields emit updates", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});

			const nameField = wrapper.findComponent({ name: "NameFormField" });
			await nameField.vm.$emit("update:modelValue", "Updated Ferment");
			await nextTick();
			expect(nameField.props("modelValue")).toBe("Updated Ferment");
		});

		it("updates failure reason when FailureReasonFormField emits update", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const reasonField = wrapper.findComponent({ name: "FailureReasonFormField" });

			await reasonField.vm.$emit("update:modelValue", "Contamination detected");
			await nextTick();
			expect(reasonField.props("modelValue")).toBe("Contamination detected");
		});
	});

	describe("cancel event", () => {
		it("emits cancel event when FermentFormActions emits cancel", async () => {
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
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
			const wrapper = await mountSuspended(EditFailedFermentForm, {
				props: { ferment: FAILED_FERMENT_WITH_DATA },
				...mountOptions
			});
			const form = wrapper.findComponent({ name: "UForm" });

			const updatedFerment: FailedFerment = {
				...FAILED_FERMENT_WITH_DATA,
				name: "Updated Ferment Name",
				reason: "Updated reason"
			};

			await form.vm.$emit("submit", { data: updatedFerment });

			expect(wrapper.emitted("submit")).toBeTruthy();
			expect(wrapper.emitted("submit")?.[0]).toEqual([updatedFerment]);
		});
	});
});
