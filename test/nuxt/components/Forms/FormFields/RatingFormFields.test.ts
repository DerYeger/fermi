import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
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

	describe("rendering", () => {
		it("renders UFormField with provided label and name", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: defaultProps
			});
			const formField = wrapper.findComponent({ name: "UFormField" });
			expect(formField.exists()).toBe(true);
			expect(formField.props("label")).toBe("Overall");
			expect(formField.props("name")).toBe("overall");
		});

		it("renders 5 star UButton components", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: defaultProps
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			expect(buttons.length).toBe(5);
		});

		it("renders UTextarea with placeholder and maxlength", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: defaultProps
			});
			const textarea = wrapper.findComponent({ name: "UTextarea" });
			expect(textarea.exists()).toBe(true);
			expect(textarea.props("placeholder")).toBe("Overall notes...");
			const textareaEl = wrapper.find("textarea");
			expect(textareaEl.attributes("maxlength")).toBeDefined();
		});

		it("displays notes value in textarea", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, notes: "Great flavor!" }
			});
			const textarea = wrapper.find("textarea");
			expect(textarea.element.value).toBe("Great flavor!");
		});
	});

	describe("star colors", () => {
		it("renders warning color for active stars when rating is set", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: 3 }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			const activeButtons = buttons.slice(0, 3);
			const inactiveButtons = buttons.slice(3);
			activeButtons.forEach((btn) => expect(btn.props("color")).toBe("warning"));
			inactiveButtons.forEach((btn) => expect(btn.props("color")).toBe("neutral"));
		});

		it("renders neutral color for all stars when no rating", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: null }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			buttons.forEach((btn) => expect(btn.props("color")).toBe("neutral"));
		});

		it("renders warning color for all stars when rating is 5", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: 5 }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			buttons.forEach((btn) => expect(btn.props("color")).toBe("warning"));
		});
	});

	describe("star interactions", () => {
		it("emits update:stars when star is clicked", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: null }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			// Click on the actual button element inside the UButton component
			await buttons.at(2)!.find("button").trigger("click");
			await flushPromises();
			expect(wrapper.emitted("update:stars")).toBeTruthy();
			const emitted = wrapper.emitted("update:stars") as (number | null)[][];
			expect(emitted.at(-1)![0]).toBe(3);
		});

		it("emits update:stars with null when same star is clicked again", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: 3 }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			// Click on the actual button element inside the UButton component
			await buttons.at(2)!.find("button").trigger("click");
			await flushPromises();
			expect(wrapper.emitted("update:stars")).toBeTruthy();
			const emitted = wrapper.emitted("update:stars") as (number | null)[][];
			expect(emitted.at(-1)![0]).toBeNull();
		});

		it("emits update:stars with new value when different star is clicked", async () => {
			const wrapper = await mountSuspended(RatingFormFields, {
				props: { ...defaultProps, stars: 3 }
			});
			const buttons = wrapper.findAllComponents({ name: "UButton" });
			// Click on the actual button element inside the UButton component
			await buttons.at(4)!.find("button").trigger("click");
			await flushPromises();
			expect(wrapper.emitted("update:stars")).toBeTruthy();
			const emitted = wrapper.emitted("update:stars") as (number | null)[][];
			expect(emitted.at(-1)![0]).toBe(5);
		});
	});
});
