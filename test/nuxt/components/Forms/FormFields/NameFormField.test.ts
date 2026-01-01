import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import NameFormField from "~/components/Forms/FormFields/NameFormField.vue";

// Mock useFermentNames
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useFermentNames: () => computed(() => ["Kimchi", "Sauerkraut", "Kombucha"])
	};
});

describe("components/Forms/FormFields/NameFormField", () => {
	it("renders UFormField with correct props", async () => {
		const wrapper = await mountSuspended(NameFormField, {
			props: {
				modelValue: ""
			}
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
		expect(formField.props("label")).toBe("Name");
		expect(formField.props("required")).toBe(true);
	});

	it("renders UInputMenu component", async () => {
		const wrapper = await mountSuspended(NameFormField, {
			props: {
				modelValue: "My Ferment"
			}
		});
		const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
		expect(inputMenu.exists()).toBe(true);
	});

	it("uFormField is required", async () => {
		const wrapper = await mountSuspended(NameFormField, {
			props: {
				modelValue: ""
			}
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.props("required")).toBe(true);
	});
});
