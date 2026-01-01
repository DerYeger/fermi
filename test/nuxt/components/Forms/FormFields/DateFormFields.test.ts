import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DateFormFields from "~/components/Forms/FormFields/DateFormFields.vue";

// Mock date validation functions
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		isStartDateUnavailable: () => false,
		isEndDateUnavailable: () => false
	};
});

describe("components/Forms/FormFields/DateFormFields", () => {
	const defaultProps = {
		startDate: "2024-01-01",
		endDate: null
	};

	it("renders two UFormField components", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: defaultProps
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		expect(formFields.length).toBe(2);
	});

	it("renders start date UFormField with correct label", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: defaultProps
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const startDateField = formFields[0]!;
		expect(startDateField.props("label")).toBe("Start date");
	});

	it("renders end date UFormField with correct label", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: defaultProps
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const endDateField = formFields[1]!;
		expect(endDateField.props("label")).toBe("End date");
	});

	it("renders InputDatePicker components", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: defaultProps
		});
		const pickers = wrapper.findAllComponents({ name: "InputDatePicker" });
		expect(pickers.length).toBe(2);
	});

	it("start date field is required", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: defaultProps
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const startDateField = formFields[0]!;
		expect(startDateField.props("required")).toBe(true);
	});

	it("end date field is required when isEndDateRequired is true", async () => {
		const wrapper = await mountSuspended(DateFormFields, {
			props: {
				startDate: "2024-01-01",
				endDate: "2024-01-15",
				isEndDateRequired: true
			}
		});
		const formFields = wrapper.findAllComponents({ name: "UFormField" });
		const endDateField = formFields[1]!;
		expect(endDateField.props("required")).toBe(true);
	});
});
