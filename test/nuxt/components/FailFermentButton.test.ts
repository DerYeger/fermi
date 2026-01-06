import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import FailFermentButton from "~/components/Forms/FailFermentForm/FailFermentButton.vue";
import { BASE_ACTIVE_FERMENT } from "../../data";
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
		useRoute: () => ({
			name: "ferments",
			params: {}
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

describe("components/FailFermentButton", () => {
	const mountOptions = {
		global: {
			stubs: {
				UModal: UModalStub,
				FailForm: true
			}
		}
	};

	it("renders fail button with correct props", async () => {
		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:waste");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Fail label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: false },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Fail");

		const hiddenWrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: true },
			...mountOptions
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal with correct props", async () => {
		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Fail ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("passes correct props to FailForm", async () => {
		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "FailForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("ferment")).toEqual(BASE_ACTIVE_FERMENT);
	});

	it("opens modal, submits form, and shows success toast with view action", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the fail button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "FailForm" });
		const failedFerment = {
			...BASE_ACTIVE_FERMENT,
			state: "failed",
			endDate: "2024-01-15",
			failedReason: "Mold contamination",
			images: []
		};
		await form.vm.$emit("submit", failedFerment);
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was called
		expect(mockUpdate).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT.id, expect.any(Function));

		// Verify success toast was shown with view action
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment failed",
				color: "success",
				actions: expect.arrayContaining([
					expect.objectContaining({
						label: "View",
						variant: "subtle",
						to: `/ferments/${BASE_ACTIVE_FERMENT.id}`
					})
				])
			})
		);

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens modal and cancels without failing", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(FailFermentButton, {
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
		const form = wrapper.findComponent({ name: "FailForm" });
		await form.vm.$emit("cancel");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was NOT called
		expect(mockUpdate).not.toHaveBeenCalled();

		// Verify no toast was shown
		expect(mockToastAdd).not.toHaveBeenCalled();

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("shows error toast when failing operation fails", async () => {
		const errorMessage = "Database connection failed";
		mockUpdate.mockReset();
		mockToastAdd.mockReset();
		mockUpdate.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(FailFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "FailForm" });
		await form.vm.$emit("submit", { ...BASE_ACTIVE_FERMENT, state: "failed", images: [] });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error failing ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
