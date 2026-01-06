import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT, BASE_FAILED_FERMENT } from "../../data";
import { UModalStub } from "../stubs";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockUpdate, mockToastAdd } = vi.hoisted(() => {
	return {
		mockUpdate: vi.fn(),
		mockToastAdd: vi.fn()
	};
});

// Mock the composables
vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		update: (...args: unknown[]) => mockUpdate(...args)
	}
}));

// Mock #imports for auto-imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useToast: () => ({
			add: mockToastAdd
		}),
		getISODatetime: () => "2024-01-15T12:00:00Z"
	};
});

// Also mock @nuxt/ui's useToast
vi.mock("@nuxt/ui/runtime/composables/useToast", () => ({
	useToast: () => ({
		add: mockToastAdd
	})
}));

vi.mock("~/types/utils", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		sortImages: (images: unknown[]) => images,
		getErrorMessage: (error: unknown) => String(error)
	};
});

describe("components/EditFermentButton", () => {
	const mountOptions = {
		global: {
			stubs: {
				UModal: UModalStub,
				EditActiveFermentForm: true,
				EditCompletedFermentForm: true,
				EditFailedFermentForm: true
			}
		}
	};

	it("renders edit button with correct props", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:edit-03");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Edit label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: false },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Edit");

		const hiddenWrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: true },
			...mountOptions
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal with correct props", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Edit ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("renders EditActiveFermentForm for active ferments with correct props", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("ferment")).toEqual(BASE_ACTIVE_FERMENT);
	});

	it("renders EditCompletedFermentForm for completed ferments with correct props", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_COMPLETED_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditCompletedFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("ferment")).toEqual(BASE_COMPLETED_FERMENT);
	});

	it("renders EditFailedFermentForm for failed ferments with correct props", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditFailedFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("ferment")).toEqual(BASE_FAILED_FERMENT);
	});

	it("opens modal, submits form, and calls update", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the edit button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		const updatedFerment = { ...BASE_ACTIVE_FERMENT, name: "Updated Ferment", images: [] };
		await form.vm.$emit("submit", updatedFerment);
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was called with the ferment id and update function
		expect(mockUpdate).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT.id, expect.any(Function));

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens modal and cancels without updating", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit cancel
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		await form.vm.$emit("cancel");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was NOT called
		expect(mockUpdate).not.toHaveBeenCalled();

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("shows error toast when update fails", async () => {
		const errorMessage = "Database connection failed";
		mockUpdate.mockReset();
		mockToastAdd.mockReset();
		mockUpdate.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		await form.vm.$emit("submit", { ...BASE_ACTIVE_FERMENT, name: "Updated Ferment", images: [] });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error updating ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
