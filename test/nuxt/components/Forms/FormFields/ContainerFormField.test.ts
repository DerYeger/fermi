import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
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
	describe("rendering", () => {
		it("renders UFormField with correct label", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: null }
			});
			const formField = wrapper.findComponent({ name: "UFormField" });
			expect(formField.exists()).toBe(true);
			expect(formField.props("label")).toBe("Container");
		});

		it("renders UInputMenu component with placeholder", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: null }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			expect(inputMenu.exists()).toBe(true);
			expect(inputMenu.props("placeholder")).toBe("Jar, Bottle, Crock...");
		});

		it("renders UInputMenu with create-item enabled", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: null }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			expect(inputMenu.props("createItem")).toBe(true);
		});
	});

	describe("clear button", () => {
		it("shows clear button when container is set", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: "Jar" }
			});
			const clearButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:cancel-01"
			);
			expect(clearButton).toBeDefined();
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

		it("clears model value when clear button is clicked", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: "Jar" }
			});
			const clearButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:cancel-01"
			);
			// Click on the actual button element inside the UButton component
			await clearButton!.find("button").trigger("click");
			await flushPromises();
			const emitted = wrapper.emitted("update:modelValue") as (string | null)[][];
			expect(emitted.at(-1)![0]).toBeNull();
		});
	});

	describe("interactions", () => {
		it("emits update:modelValue when item is created", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: null }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			await inputMenu.vm.$emit("create", "New Container");
			await flushPromises();
			expect(wrapper.emitted("update:modelValue")).toBeTruthy();
			const emitted = wrapper.emitted("update:modelValue") as (string | null)[][];
			expect(emitted.at(-1)![0]).toBe("New Container");
		});

		it("trims whitespace from created items", async () => {
			const wrapper = await mountSuspended(ContainerFormField, {
				props: { modelValue: null }
			});
			const inputMenu = wrapper.findComponent({ name: "UInputMenu" });
			await inputMenu.vm.$emit("create", "  Trimmed Container  ");
			await flushPromises();
			const emitted = wrapper.emitted("update:modelValue") as (string | null)[][];
			expect(emitted.at(-1)![0]).toBe("Trimmed Container");
		});
	});
});
