import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
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
	describe("rendering", () => {
		it("renders UFormField as required with correct label", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "" }
			});
			const formField = wrapper.findComponent({ name: "UFormField" });
			expect(formField.exists()).toBe(true);
			expect(formField.props("label")).toBe("Name");
			expect(formField.props("required")).toBe(true);
		});

		it("renders UInputMenu with placeholder", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "" }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			expect(inputMenu.exists()).toBe(true);
			expect(inputMenu.props("placeholder")).toBe("Garlic Honey, Kimchi, Sauerkraut...");
		});

		it("renders UInputMenu with create-item enabled", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "" }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			expect(inputMenu.props("createItem")).toBe(true);
		});
	});

	describe("model value", () => {
		it("displays provided model value", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "My Ferment" }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			expect(inputMenu.props("modelValue")).toBe("My Ferment");
		});
	});

	describe("interactions", () => {
		it("emits update:modelValue when item is created", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "" }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			await inputMenu.vm.$emit("create", "New Ferment");
			await flushPromises();
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			const emitted = wrapper.emitted("update:modelValue") as string[][];
			expect(emitted.at(-1)![0]).toBe("New Ferment");
		});

		it("trims whitespace from created items", async () => {
			const wrapper = await mountSuspended(NameFormField, {
				props: { modelValue: "" }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			await inputMenu.vm.$emit("create", "  Trimmed Name  ");
			await flushPromises();
			const emitted = wrapper.emitted("update:modelValue") as string[][];
			expect(emitted.at(-1)![0]).toBe("Trimmed Name");
		});
	});
});
