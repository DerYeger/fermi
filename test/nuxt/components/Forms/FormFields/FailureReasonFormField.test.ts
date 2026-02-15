import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FailureReasonFormField from "~/components/Forms/FormFields/FailureReasonFormField.vue";

describe("components/Forms/FormFields/FailureReasonFormField", () => {
	it("renders UFormField component", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
	});

	it("renders UFormField with Reason label", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.props("label")).toBe("Reason");
	});

	it("renders UTextarea component", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		const textarea = wrapper.findComponent({ name: "UTextarea" });
		expect(textarea.exists()).toBe(true);
	});

	it("renders textarea element", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		expect(wrapper.find("textarea").exists()).toBe(true);
	});

	it("shows provided reason value", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "Mold appeared" }
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.element.value).toBe("Mold appeared");
	});

	it("has maxlength attribute", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("maxlength")).toBeDefined();
	});

	it("has 4 rows", async () => {
		const wrapper = await mountSuspended(FailureReasonFormField, {
			props: { modelValue: "" }
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.attributes("rows")).toBe("4");
	});
});
