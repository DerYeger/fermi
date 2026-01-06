import type { FermentImage } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import ExifReader from "exifreader";
import { describe, expect, it, vi } from "vitest";
import ImagesFormField from "~/components/Forms/FormFields/ImagesFormField.vue";
import { fileUploadClickMock, UFileUploadStub } from "../../../stubs";

const mockToastAdd = vi.fn();

// Mock composables
vi.mock("~/composables/id", () => ({
	createId: () => "new-img-id"
}));

vi.mock("~/composables/time", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		getISODate: () => "2024-01-15"
	};
});

vi.mock("@nuxt/ui/runtime/composables/useToast", () => ({
	useToast: () => ({
		add: mockToastAdd
	})
}));

vi.mock("~/types/utils", () => ({
	getErrorMessage: (error: unknown) => String(error),
	sortImages: (images: unknown[]) => images
}));

// Store mock implementations
let compressorImpl: ((file: File, opts: { success: (blob: Blob) => void, error: (err: Error) => void }) => void) | null = null;

// Mock Compressor as a constructor
vi.mock("compressorjs", () => ({
	default: class MockCompressor {
		constructor(file: File, opts: { success: (blob: Blob) => void, error: (err: Error) => void }) {
			if (compressorImpl) {
				compressorImpl(file, opts);
			}
		}
	}
}));

// Mock ExifReader
vi.mock("exifreader", () => ({
	default: {
		load: vi.fn()
	}
}));

function setupCompressorMock(options: {
	success?: boolean
	delay?: boolean
	resolveRef?: { resolve?: (blob: Blob) => void }
} = {}) {
	const { success = true, delay = false, resolveRef } = options;
	compressorImpl = (_file, opts) => {
		const { success: onSuccess, error: onError } = opts;
		if (resolveRef) {
			resolveRef.resolve = (blob: Blob) => onSuccess(blob);
		} else if (delay) {
			setTimeout(() => {
				if (success) {
					onSuccess(new Blob(["compressed"], { type: "image/jpeg" }));
				} else {
					onError(new Error("Compression failed"));
				}
			}, 0);
		} else {
			if (success) {
				onSuccess(new Blob(["compressed"], { type: "image/jpeg" }));
			} else {
				onError(new Error("Compression failed"));
			}
		}
	};
}

describe("components/Forms/FormFields/ImagesFormField", () => {
	const emptyImages: FermentImage[] = [];

	const singleImage: FermentImage[] = [
		{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" }
	];

	const multipleImages: FermentImage[] = [
		{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" },
		{ id: "img-2", base64: "data:image/png;base64,def456", date: "2024-01-02" },
		{ id: "img-3", base64: "data:image/png;base64,ghi789", date: "2024-01-03" }
	];

	function mountComponent(images: FermentImage[] = emptyImages) {
		return mountSuspended(ImagesFormField, {
			props: { modelValue: images },
			global: {
				stubs: {
					UFileUpload: UFileUploadStub
				}
			}
		});
	}

	describe("rendering", () => {
		it("renders UFormField with correct label and name", async () => {
			const wrapper = await mountComponent();
			const formField = wrapper.findComponent({ name: "UFormField" });
			expect(formField.exists()).toBe(true);
			expect(formField.props("label")).toBe("Images");
			expect(formField.props("name")).toBe("images");
		});

		it("renders upload button with correct props", async () => {
			const wrapper = await mountComponent();
			const uploadButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:image-upload"
			);
			expect(uploadButton).toBeDefined();
			expect(uploadButton?.props("label")).toBe("Select images");
			expect(uploadButton?.props("variant")).toBe("subtle");
		});

		it("renders hidden file input for upload", async () => {
			const wrapper = await mountComponent();
			const input = wrapper.find("input[type='file']");
			expect(input.exists()).toBe(true);
		});

		it("file input accepts image types and allows multiple selection", async () => {
			const wrapper = await mountComponent();
			const input = wrapper.find("input[type='file']");
			expect(input.attributes("accept")).toBe("image/*");
			expect(input.attributes("multiple")).toBeDefined();
		});
	});

	describe("empty state", () => {
		it("does not render images when array is empty", async () => {
			const wrapper = await mountComponent(emptyImages);
			expect(wrapper.findAll("img")).toHaveLength(0);
		});

		it("does not render UScrollArea when no images", async () => {
			const wrapper = await mountComponent(emptyImages);
			const scrollArea = wrapper.findComponent({ name: "UScrollArea" });
			expect(scrollArea.exists()).toBe(false);
		});

		it("does not render delete buttons when no images", async () => {
			const wrapper = await mountComponent(emptyImages);
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			expect(deleteButtons).toHaveLength(0);
		});

		it("does not render InputDatePicker when no images", async () => {
			const wrapper = await mountComponent(emptyImages);
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			expect(datePicker.exists()).toBe(false);
		});
	});

	describe("with images", () => {
		it("renders one image for single image", async () => {
			const wrapper = await mountComponent(singleImage);
			expect(wrapper.findAll("img")).toHaveLength(1);
		});

		it("renders multiple images for multiple images array", async () => {
			const wrapper = await mountComponent(multipleImages);
			expect(wrapper.findAll("img")).toHaveLength(3);
		});

		it("renders UScrollArea when images exist", async () => {
			const wrapper = await mountComponent(singleImage);
			const scrollArea = wrapper.findComponent({ name: "UScrollArea" });
			expect(scrollArea.exists()).toBe(true);
		});

		it("displays image with correct src attribute", async () => {
			const wrapper = await mountComponent(singleImage);
			const img = wrapper.find("img");
			expect(img.attributes("src")).toBe("data:image/png;base64,abc123");
		});

		it("displays image with correct alt attribute", async () => {
			const wrapper = await mountComponent(singleImage);
			const img = wrapper.find("img");
			expect(img.attributes("alt")).toBe("Ferment image");
		});

		it("renders delete button for each image", async () => {
			const wrapper = await mountComponent(multipleImages);
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			expect(deleteButtons).toHaveLength(3);
		});

		it("renders delete buttons with correct props", async () => {
			const wrapper = await mountComponent(singleImage);
			const deleteButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			expect(deleteButton?.props("color")).toBe("error");
			expect(deleteButton?.props("variant")).toBe("subtle");
		});

		it("renders InputDatePicker for each image", async () => {
			const wrapper = await mountComponent(multipleImages);
			const datePickers = wrapper.findAllComponents({ name: "InputDatePicker" });
			expect(datePickers).toHaveLength(3);
		});

		it("renders UFormField for each image date with correct name", async () => {
			const wrapper = await mountComponent(multipleImages);
			const dateFormFields = wrapper.findAllComponents({ name: "UFormField" }).filter(
				(field) => field.props("name")?.includes("images.")
			);
			expect(dateFormFields[0]!.props("name")).toBe("images.0.date");
			expect(dateFormFields[1]!.props("name")).toBe("images.1.date");
			expect(dateFormFields[2]!.props("name")).toBe("images.2.date");
		});
	});

	describe("deletion", () => {
		it("removes image when delete button is clicked", async () => {
			const images = [
				{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" },
				{ id: "img-2", base64: "data:image/png;base64,def456", date: "2024-01-02" },
				{ id: "img-3", base64: "data:image/png;base64,ghi789", date: "2024-01-03" }
			];
			const wrapper = await mountComponent(images);
			expect(images).toHaveLength(3);
			// Find delete buttons by looking at UButton components with the delete icon
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			// Emit click event by triggering the component's click handler
			await deleteButtons[1]!.vm.$emit("click");
			expect(images).toHaveLength(2);
		});

		it("removes the first image when first delete button is clicked", async () => {
			const images = [
				{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" },
				{ id: "img-2", base64: "data:image/png;base64,def456", date: "2024-01-02" },
				{ id: "img-3", base64: "data:image/png;base64,ghi789", date: "2024-01-03" }
			];
			const wrapper = await mountComponent(images);
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			await deleteButtons[0]!.vm.$emit("click");
			expect(images).toHaveLength(2);
			expect(images[0]!.base64).toBe("data:image/png;base64,def456");
		});

		it("removes the last image when last delete button is clicked", async () => {
			const images = [
				{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" },
				{ id: "img-2", base64: "data:image/png;base64,def456", date: "2024-01-02" },
				{ id: "img-3", base64: "data:image/png;base64,ghi789", date: "2024-01-03" }
			];
			const wrapper = await mountComponent(images);
			const deleteButtons = wrapper.findAllComponents({ name: "UButton" }).filter(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			await deleteButtons[2]!.vm.$emit("click");
			expect(images).toHaveLength(2);
			expect(images[1]!.base64).toBe("data:image/png;base64,def456");
		});

		it("can remove the last remaining image", async () => {
			const images = [
				{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" }
			];
			const wrapper = await mountComponent(images);
			expect(images).toHaveLength(1);
			const deleteButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:delete-02"
			);
			await deleteButton?.vm.$emit("click");
			expect(images).toHaveLength(0);
		});
	});

	describe("editing", () => {
		it("allows editing image date via InputDatePicker", async () => {
			const wrapper = await mountComponent(singleImage);
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			expect(datePicker.exists()).toBe(true);
			expect(datePicker.props("modelValue")).toBe("2024-01-01");
		});

		it("updates image date when InputDatePicker emits update", async () => {
			const images = [
				{ id: "img-1", base64: "data:image/png;base64,abc123", date: "2024-01-01" }
			];
			const wrapper = await mountComponent(images);
			const datePicker = wrapper.findComponent({ name: "InputDatePicker" });
			await datePicker.vm.$emit("update:modelValue", "2024-06-15");
			expect(images[0]!.date).toBe("2024-06-15");
		});
	});

	describe("upload button", () => {
		it("upload button is not loading by default", async () => {
			const wrapper = await mountComponent();
			const uploadButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:image-upload"
			);
			expect(uploadButton?.props("loading")).toBe(false);
		});

		it("triggers file input click when upload button is clicked", async () => {
			fileUploadClickMock.mockClear();
			const wrapper = await mountComponent();
			const uploadButton = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:image-upload"
			);
			await uploadButton?.vm.$emit("click");
			expect(fileUploadClickMock).toHaveBeenCalled();
		});
	});

	describe("file upload processing", () => {
		it("does nothing when files is null", async () => {
			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			await fileUpload.vm.$emit("update:model-value", null);
			expect(images).toHaveLength(0);
		});

		it("does nothing when files is undefined", async () => {
			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			await fileUpload.vm.$emit("update:model-value", undefined);
			expect(images).toHaveLength(0);
		});

		it("processes uploaded files and adds them to model", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockResolvedValue({
				DateTimeOriginal: { description: "2024:03:15 10:30:00" }
			} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(images[0]!.id).toBe("new-img-id");
			expect(images[0]!.date).toBe("2024-03-15");
		});

		it("uses Date Created exif field when DateTimeOriginal is not available", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockResolvedValue({
				"Date Created": { description: "2024:05:20 14:00:00" }
			} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(images[0]!.date).toBe("2024-05-20");
		});

		it("uses Modify Date exif field as fallback", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockResolvedValue({
				"Modify Date": { description: "2024:06:10 09:15:00" }
			} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(images[0]!.date).toBe("2024-06-10");
		});

		it("uses current date when no exif date is available", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockResolvedValue({} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(images[0]!.date).toBe("2024-01-15");
		});

		it("uses current date when exif reading fails", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockRejectedValue(new Error("EXIF read error"));

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(images[0]!.date).toBe("2024-01-15");
		});

		it("processes multiple files at once", async () => {
			setupCompressorMock({ delay: true });
			vi.mocked(ExifReader.load).mockResolvedValue({} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const files = [
				new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
				new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
				new File(["test3"], "test3.jpg", { type: "image/jpeg" })
			];
			await fileUpload.vm.$emit("update:model-value", files);
			await vi.waitFor(() => expect(images).toHaveLength(3));
		});

		it("shows error toast when compression fails", async () => {
			setupCompressorMock({ success: false, delay: true });

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			await fileUpload.vm.$emit("update:model-value", [file]);
			await vi.waitFor(() => expect(mockToastAdd).toHaveBeenCalled());
			expect(mockToastAdd).toHaveBeenCalledWith({
				title: "Error uploading images",
				description: "Error: Compression failed",
				color: "error"
			});
			expect(images).toHaveLength(0);
		});

		it("sets loading state during upload processing", async () => {
			const resolveRef: { resolve?: (blob: Blob) => void } = {};
			setupCompressorMock({ resolveRef });
			vi.mocked(ExifReader.load).mockResolvedValue({} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			fileUpload.vm.$emit("update:model-value", [file]);
			await wrapper.vm.$nextTick();
			const uploadButtonDuringLoad = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:image-upload"
			);
			expect(uploadButtonDuringLoad?.props("loading")).toBe(true);
			resolveRef.resolve!(new Blob(["compressed"], { type: "image/jpeg" }));
			await vi.waitFor(() => expect(images).toHaveLength(1));
			const uploadButtonAfterLoad = wrapper.findAllComponents({ name: "UButton" }).find(
				(btn) => btn.props("icon") === "hugeicons:image-upload"
			);
			expect(uploadButtonAfterLoad?.props("loading")).toBe(false);
		});

		it("disables file input during upload processing", async () => {
			const resolveRef: { resolve?: (blob: Blob) => void } = {};
			setupCompressorMock({ resolveRef });
			vi.mocked(ExifReader.load).mockResolvedValue({} as Awaited<ReturnType<typeof ExifReader.load>>);

			const images: FermentImage[] = [];
			const wrapper = await mountComponent(images);
			const fileUpload = wrapper.findComponent({ name: "UFileUpload" });
			const file = new File(["test"], "test.jpg", { type: "image/jpeg" });
			fileUpload.vm.$emit("update:model-value", [file]);
			await wrapper.vm.$nextTick();
			expect(fileUpload.props("disabled")).toBe(true);
			resolveRef.resolve!(new Blob(["compressed"], { type: "image/jpeg" }));
			await vi.waitFor(() => expect(images).toHaveLength(1));
			expect(fileUpload.props("disabled")).toBe(false);
		});
	});
});
