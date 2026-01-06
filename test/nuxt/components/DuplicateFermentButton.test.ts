import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import DuplicateFermentButton from "~/components/DuplicateFermentButton.vue";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT, BASE_FAILED_FERMENT } from "../../data";
import { UModalStub } from "../stubs";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockInsert, mockToastAdd } = vi.hoisted(() => {
	return {
		mockInsert: vi.fn(),
		mockToastAdd: vi.fn()
	};
});

// Mock the composables
vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		insert: (...args: unknown[]) => mockInsert(...args)
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
		getISODatetime: () => "2024-01-15T12:00:00Z",
		createId: () => "new-duplicate-id"
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

describe("components/DuplicateFermentButton", () => {
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

	it("renders UButton with correct props", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:copy-01");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Duplicate label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: false },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Duplicate");

		const hiddenWrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: true },
			...mountOptions
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal with correct props", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Duplicate ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("renders EditActiveFermentForm for active ferments with correct props", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("submitLabel")).toBe("Duplicate");
		// Check that the form receives a ferment with a new id (not the original) and same base data
		const formFerment = form.props("ferment");
		expect(formFerment.id).not.toBe(BASE_ACTIVE_FERMENT.id);
		expect(formFerment.name).toBe(BASE_ACTIVE_FERMENT.name);
		expect(formFerment.state).toBe(BASE_ACTIVE_FERMENT.state);
	});

	it("renders EditCompletedFermentForm for completed ferments with correct props", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_COMPLETED_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditCompletedFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("submitLabel")).toBe("Duplicate");
	});

	it("renders EditFailedFermentForm for failed ferments with correct props", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "EditFailedFermentForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("submitLabel")).toBe("Duplicate");
	});

	it("opens modal, submits form, and shows success toast with view action", async () => {
		mockInsert.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the duplicate button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "EditActiveFermentForm" });
		const duplicatedFerment = {
			...BASE_ACTIVE_FERMENT,
			id: "new-duplicate-id",
			images: []
		};
		await form.vm.$emit("submit", duplicatedFerment);
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify insert was called
		expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
			id: "new-duplicate-id"
		}));

		// Verify success toast was shown with view action
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment duplicated",
				color: "success",
				actions: expect.arrayContaining([
					expect.objectContaining({
						label: "View",
						variant: "subtle",
						to: `/ferments/new-duplicate-id`
					})
				])
			})
		);

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens modal and cancels without duplicating", async () => {
		mockInsert.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(DuplicateFermentButton, {
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

		// Verify insert was NOT called
		expect(mockInsert).not.toHaveBeenCalled();

		// Verify no toast was shown
		expect(mockToastAdd).not.toHaveBeenCalled();

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("shows error toast when duplication fails", async () => {
		const errorMessage = "Database connection failed";
		mockInsert.mockReset();
		mockToastAdd.mockReset();
		mockInsert.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(DuplicateFermentButton, {
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
		await form.vm.$emit("submit", { ...BASE_ACTIVE_FERMENT, id: "new-duplicate-id", images: [] });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error duplicating ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
