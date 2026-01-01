import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import RatingFormFields from "~/components/Forms/FormFields/RatingFormFields.vue";

// Mock MAX_NOTES_LENGTH
vi.mock("~/types/ferment", () => ({
	MAX_NOTES_LENGTH: 1000
}));

describe("components/Forms/FormFields/RatingFormFields", () => {
	const defaultProps = {
		name: "overall",
		label: "Overall",
		placeholder: "Overall notes",
		stars: null,
		notes: ""
	};

	it("renders UFormField component", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: defaultProps
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
	});

	it("renders UFormField with provided label", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: defaultProps
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.props("label")).toBe("Overall");
	});

	it("renders 5 star UButton components", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: defaultProps
		});
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		expect(buttons.length).toBe(5);
	});

	it("renders UTextarea component", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: defaultProps
		});
		const textarea = wrapper.findComponent({ name: "UTextarea" });
		expect(textarea.exists()).toBe(true);
	});

	it("renders warning color for active stars", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: {
				...defaultProps,
				stars: 3
			}
		});
		// When stars are selected, buttons should have warning color
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const activeButtons = buttons.slice(0, 3);
		activeButtons.forEach((btn) => {
			expect(btn.props("color")).toBe("warning");
		});
	});

	it("renders neutral color for inactive stars when no rating", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: {
				...defaultProps,
				stars: null
			}
		});
		// When no stars selected, all should have neutral color
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		buttons.forEach((btn) => {
			expect(btn.props("color")).toBe("neutral");
		});
	});

	it("textarea has maxlength attribute", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: defaultProps
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("maxlength")).toBeDefined();
	});

	it("displays notes value in textarea", async () => {
		const wrapper = await mountSuspended(RatingFormFields, {
			props: {
				...defaultProps,
				notes: "Great flavor!"
			}
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.element.value).toBe("Great flavor!");
	});
});
