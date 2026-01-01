import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";

// Mock utilities and composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useToast: () => ({
			add: vi.fn()
		})
	};
});

vi.mock("~/types/utils", () => ({
	getErrorMessage: (error: unknown) => String(error),
	sortImages: (images: unknown[]) => images
}));

describe("components/Forms/FormFields/ImagesFormField", () => {
	const mockImages = [
		{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" },
		{ id: "img-2", base64: "data:image/png;base64,def456", date: "2024-01-02" }
	];

	it("renders UFormField component", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.exists()).toBe(true);
	});

	it("renders UFormField with Images label", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		const formField = wrapper.findComponent({ name: "UFormField" });
		expect(formField.props("label")).toBe("Images");
	});

	it("renders UButton for upload", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
	});

	it("shows images when provided", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: mockImages }
		});
		// Should show images
		expect(wrapper.findAll("img").length).toBeGreaterThan(0);
	});

	it("does not show scroll area when no images", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		// Scroll area should not be visible when empty
		expect(wrapper.findAll("img").length).toBe(0);
	});

	it("renders delete buttons with correct props when images exist", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: mockImages }
		});
		const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
			(btn) => btn.props("icon") === "hugeicons:delete-02"
		);
		expect(deleteButtons.length).toBeGreaterThan(0);
	});

	it("renders hidden file input for upload", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		const input = wrapper.find("input[type='file']");
		expect(input.exists()).toBe(true);
	});

	it("file input accepts image types", async () => {
		const wrapper = await mountSuspended(ImagesFormField, {
			props: { modelValue: [] }
		});
		const input = wrapper.find("input[type='file']");
		expect(input.attributes("accept")).toBe("image/*");
	});
});
