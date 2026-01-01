import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import NotesFormField from "~/components/Forms/FormFields/NotesFormField.vue";

describe("components/Forms/FormFields/NotesFormField", () => {
	it("renders UFormField with Notes label", async () => {
		const wrapper = await mountSuspended(NotesFormField, {
			props: {
				modelValue: ""
			}
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
		expect(formField.props("label")).toBe("Notes");
	});

	it("renders UTextarea component", async () => {
		const wrapper = await mountSuspended(NotesFormField, {
			props: {
				modelValue: ""
			}
		});
		const textarea = wrapper.findComponent({ name: "UTextarea" });
		expect(textarea.exists()).toBe(true);
	});

	it("displays initial model value", async () => {
		const wrapper = await mountSuspended(NotesFormField, {
			props: {
				modelValue: "Initial notes"
			}
		});
		const textarea = wrapper.find("textarea");
		expect(textarea.element.value).toBe("Initial notes");
	});

	it("emits update:modelValue on input", async () => {
		const wrapper = await mountSuspended(NotesFormField, {
			props: {
				modelValue: ""
			}
		});
		const textarea = wrapper.find("textarea");
		await textarea.setValue("New notes");
		expect(wrapper.emitted("update:modelValue")).toBeTruthy();
	});
});
