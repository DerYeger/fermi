import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ContainerFormField from "~/components/Forms/FormFields/ContainerFormField.vue";

// Mock container composable
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useFermentContainers: () => ["Jar", "Crock", "Bottle"]
	};
});

describe("components/Forms/FormFields/ContainerFormField", () => {
	it("renders UFormField component", async () => {
		const wrapper = await mountSuspended(ContainerFormField, {
			props: { modelValue: null }
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
		expect(formField.props("label")).toBe("Container");
	});

	it("renders UInputMenu component", async () => {
		const wrapper = await mountSuspended(ContainerFormField, {
			props: { modelValue: null }
		});
		const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
		expect(inputMenu.exists()).toBe(true);
	});

	it("shows clear button when container is set", async () => {
		const wrapper = await mountSuspended(ContainerFormField, {
			props: { modelValue: "Jar" }
		});
		const clearButton = wrapper.findAllComponents({ name: "UButton" }).find(
			(btn) => btn.props("icon") === "hugeicons:cancel-01"
		);
		expect(clearButton).toBeDefined();
	});

	it("clear button has correct props", async () => {
		const wrapper = await mountSuspended(ContainerFormField, {
			props: { modelValue: "Jar" }
		});
		const clearButton = wrapper.findAllComponents({ name: "UButton" }).find(
			(btn) => btn.props("icon") === "hugeicons:cancel-01"
		);
		expect(clearButton?.props("variant")).toBe("subtle");
		expect(clearButton?.props("color")).toBe("error");
	});

	it("does not show clear button when container is null", async () => {
		const wrapper = await mountSuspended(ContainerFormField, {
			props: { modelValue: null }
		});
		const clearButton = wrapper.findAllComponents({ name: "UButton" }).find(
			(btn) => btn.props("icon") === "hugeicons:cancel-01"
		);
		expect(clearButton).toBeUndefined();
	});
});
