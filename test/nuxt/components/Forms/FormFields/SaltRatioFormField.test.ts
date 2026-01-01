import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SaltRatioFormField from "~/components/Forms/FormFields/SaltRatioFormField.vue";

describe("components/Forms/FormFields/SaltRatioFormField", () => {
	it("renders UFormField with Salt ratio label and required", async () => {
		const wrapper = await mountSuspended(SaltRatioFormField, {
			props: {
				modelValue: 0.02
			}
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
		expect(formField.props("label")).toBe("Salt ratio (%)");
		expect(formField.props("required")).toBe(true);
	});

	it("renders UInputNumber component", async () => {
		const wrapper = await mountSuspended(SaltRatioFormField, {
			props: {
				modelValue: 0.02
			}
		});
		const inputNumber = wrapper.findComponent({ name: "UInputNumber" });
		expect(inputNumber.exists()).toBe(true);
	});

	it("renders 5 preset buttons with subtle variant", async () => {
		const wrapper = await mountSuspended(SaltRatioFormField, {
			props: {
				modelValue: 0.02
			}
		});
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const subtleButtons = buttons.filter((btn) => btn.props("variant") === "subtle");
		expect(subtleButtons.length).toBe(5);
	});

	it("preset buttons have correct labels", async () => {
		const wrapper = await mountSuspended(SaltRatioFormField, {
			props: {
				modelValue: 0.02
			}
		});
		// Find the actual button elements - checking preset labels exist
		// formatPercentage uses Intl.NumberFormat with 1 decimal place
		const buttons = wrapper.findAll("button");
		const buttonTexts = buttons.map((btn) => btn.text());
		expect(buttonTexts).toContain("0.0%");
		expect(buttonTexts).toContain("2.0%");
		expect(buttonTexts).toContain("2.5%");
	});
});
