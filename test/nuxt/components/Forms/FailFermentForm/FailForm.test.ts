import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FailForm from "~/components/Forms/FailFermentForm/FailForm.vue";
import { BASE_ACTIVE_FERMENT } from "../../../../data";

// Mock form field components
vi.mock("~/components/Forms/FormFields/ImagesFormField.vue", () => ({
	default: { name: "ImagesFormField", props: ["modelValue"], template: "<div></div>" }
}));
vi.mock("~/components/Forms/FormFields/FailureReasonFormField.vue", () => ({
	default: { name: "FailureReasonFormField", props: ["modelValue"], template: "<div></div>" }
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
		useToast: () => ({
			add: vi.fn()
		}),
		isStartDateUnavailable: () => false,
		isEndDateUnavailable: () => false
	};
});

vi.mock("~/types/ferment", () => ({
	FailedFermentSchema: {
		parse: vi.fn()
	},
	MAX_NOTES_LENGTH: 1000
}));

describe("components/Forms/FailFermentForm/FailForm", () => {
	it("renders UForm component", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const form = wrapper.findComponent({ name: "UForm" });
		expect(form.exists()).toBe(true);
	});

	it("renders UFormField for End date", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const endDateField = formFields.find((f) => f.props("label") === "End date");
		expect(endDateField).toBeDefined();
	});

	it("renders ImagesFormField component", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const imagesField = wrapper.findComponent({ name: "ImagesFormField" });
		expect(imagesField.exists()).toBe(true);
	});

	it("renders FailureReasonFormField component", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const reasonField = wrapper.findComponent({ name: "FailureReasonFormField" });
		expect(reasonField.exists()).toBe(true);
	});

	it("renders FermentFormActions with Complete submit label", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		expect(actions.exists()).toBe(true);
		expect(actions.props("submitLabel")).toBe("Complete");
	});

	it("emits cancel event when FermentFormActions emits cancel", async () => {
		const wrapper = await mountSuspended(FailForm, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const actions = wrapper.findComponent({ name: "FermentFormActions" });
		await actions.vm.$emit("cancel");
		expect(wrapper.emitted("cancel")).toBeTruthy();
	});
});
