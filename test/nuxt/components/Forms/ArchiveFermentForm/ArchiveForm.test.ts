import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ArchiveForm from "~/components/Forms/ArchiveFermentForm/ArchiveForm.vue";
import { ACTIVE_FERMENT_WITH_DATA, ACTIVE_FERMENT_WITH_END_DATE, BASE_ACTIVE_FERMENT } from "../../../../data";

// Mock form field components
vi.mock("~/components/Forms/FormFields/ImagesFormField.vue", () => ({
	default: { name: "ImagesFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/RatingFormFields.vue", () => ({
	default: { name: "RatingFormFields", props: ["stars", "notes", "label", "name", "placeholder"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FermentFormActions.vue", () => ({
	default: { name: "FermentFormActions", props: ["submitLabel"], emits: ["cancel"], template: "<div></div>" }
}));

// Mock date composables and constants
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		today: ref("2024-01-15"),
		getISODate: () => "2024-01-15",
		useFermentContainers: () => [],
		useToast: () => ({
			add: vi.fn()
		}),
		isStartDateUnavailable: () => false,
		isEndDateUnavailable: () => false
	};
});

vi.mock("~/types/ferment", () => ({
	CompletedFermentSchema: {
		parse: vi.fn((data: object) => data)
	},
	MAX_NOTES_LENGTH: 1000,
	RATING_CATEGORIES: [
		{ key: "overall", name: "Overall", placeholder: "Overall notes" },
		{ key: "flavor", name: "Flavor", placeholder: "Flavor notes" },
		{ key: "texture", name: "Texture", placeholder: "Texture notes" },
		{ key: "smell", name: "Smell", placeholder: "Smell notes" },
		{ key: "process", name: "Process", placeholder: "Process notes" }
	]
}));

describe("components/Forms/ArchiveFermentForm/ArchiveForm", () => {
	describe("rendering", () => {
		it("renders UForm component", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const form = wrapper.findComponent({ name: "UForm" });
			expect(form.exists()).toBe(true);
		});

		it("renders UFormField for End date with required attribute", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const formFields = wrapper.findAllComponents({ name: "UFormField" });
			const endDateField = formFields.find((f) => f.props("label") === "End date");
			expect(endDateField).toBeDefined();
			expect(endDateField?.props("required")).toBe(true);
		});

		it("renders InputDatePicker component", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			expect(datePicker.exists()).toBe(true);
		});

		it("renders ImagesFormField component", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const imagesField = wrapper.findComponent({ name: "ImagesFormField" });
			expect(imagesField.exists()).toBe(true);
		});

		it("renders RatingFormFields for all 5 rating categories", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });
			expect(ratingFields.length).toBe(5);
		});

		it("renders FermentFormActions with Complete submit label", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			expect(actions.exists()).toBe(true);
			expect(actions.props("submitLabel")).toBe("Complete");
		});
	});

	describe("ferment data variations", () => {
		it("renders with ferment that has existing data", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			const form = wrapper.findComponent({ name: "UForm" });
			expect(form.exists()).toBe(true);
		});

		it("renders with ferment that has existing end date", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: ACTIVE_FERMENT_WITH_END_DATE }
			});
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			expect(datePicker.props("modelValue")).toBe(ACTIVE_FERMENT_WITH_END_DATE.endDate);
		});

		it("defaults end date to a valid ISO date when ferment has no end date", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			// Should default to today's date (in ISO format YYYY-MM-DD)
			expect(datePicker.props("modelValue")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe("events", () => {
		it("emits cancel event when FermentFormActions emits cancel", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const actions = wrapper.findComponent({ name: "FermentFormActions" });
			await actions.vm.$emit("cancel");
			await flushPromises();
			expect(wrapper.emitted("cancel")).toBeTruthy();
		});
	});

	describe("rating fields configuration", () => {
		it("passes correct props to RatingFormFields components", async () => {
			const wrapper = await mountSuspended(ArchiveForm, {
				props: { ferment: BASE_ACTIVE_FERMENT }
			});
			const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });
			const expectedCategories = ["Overall", "Flavor", "Texture", "Smell", "Process"];
			expectedCategories.forEach((category, index) => {
				expect(ratingFields.at(index)!.props("label")).toBe(category);
			});
		});
	});
});
