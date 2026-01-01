import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ArchiveForm from "~/components/Forms/ArchiveFermentForm/ArchiveForm.vue";

// Mock form field components
vi.mock("~/components/Forms/FormFields/ImagesFormField.vue", () => ({
	default: { name: "ImagesFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/RatingFormFields.vue", () => ({
	default: { name: "RatingFormFields", props: ["category", "modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FermentFormActions.vue", () => ({
	default: { name: "FermentFormActions", props: ["submitLabel"], emits: ["cancel"], template: "<div></div>" }
}));

// Mock date composables and constants
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		today: { value: "2024-01-15" },
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
		parse: vi.fn()
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
	const activeFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Test Ferment",
		state: "active" as const,
		startDate: "2024-01-01",
		endDate: null,
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z"
	};

	it("renders UForm component", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const form = wrapper.findComponent({ name: "UForm" });
		expect(form.exists()).toBe(true);
	});

	it("renders UFormField for End date", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const endDateField = formFields.find((f) => f.props("label") === "End date");
		expect(endDateField).toBeDefined();
	});

	it("renders ImagesFormField component", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const imagesField = wrapper.findComponent({ name: "ImagesFormField" });
		expect(imagesField.exists()).toBe(true);
	});

	it("renders RatingFormFields for all rating categories", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const ratingFields = wrapper.findAllComponents({ name: "RatingFormFields" });
		expect(ratingFields.length).toBe(5);
	});

	it("renders FermentFormActions with Complete submit label", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.exists()).toBe(true);
		expect(actions.props("submitLabel")).toBe("Complete");
	});

	it("emits cancel event when FermentFormActions emits cancel", async () => {
		const wrapper = await mountSuspended(ArchiveForm, {
			props: { ferment: activeFerment }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		await actions.vm.$emit("cancel");
		expect(wrapper.emitted("cancel")).toBeTruthy();
	});
});
