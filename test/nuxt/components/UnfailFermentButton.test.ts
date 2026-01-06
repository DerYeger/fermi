import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import UnfailFermentButton from "~/components/UnfailFermentButton.vue";
import { BASE_FAILED_FERMENT } from "../../data";
import { UModalStub } from "../stubs";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockUpdate, mockToastAdd } = vi.hoisted(() => ({
	mockUpdate: vi.fn(),
	mockToastAdd: vi.fn()
}));

// Mock the composables
vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		update: mockUpdate
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
		})
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
		getErrorMessage: (error: unknown) => String(error)
	};
});

describe("components/UnfailFermentButton", () => {
	it("renders restore button with waste-restore icon and correct props", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:waste-restore");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Restore label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Restore");

		const hiddenWrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal for confirmation dialog with correct props", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Restore ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("opens confirmation dialog, confirms restoration, and calls update", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the restore button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the confirm Restore button inside the modal body (variant="subtle", color="warning")
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "warning"
		);
		expect(confirmButton).toBeDefined();

		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was called with the ferment id
		expect(mockUpdate).toHaveBeenCalledWith(BASE_FAILED_FERMENT.id, expect.any(Function));

		// Verify dialog was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens confirmation dialog and cancels without restoring", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the restore button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the Cancel button inside the modal body (variant="ghost", color="neutral")
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const cancelButton = buttons.find((btn) =>
			btn.props("variant") === "ghost" && btn.props("color") === "neutral"
		);
		expect(cancelButton).toBeDefined();

		await cancelButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was NOT called
		expect(mockUpdate).not.toHaveBeenCalled();

		// Verify no toast was shown
		expect(mockToastAdd).not.toHaveBeenCalled();

		// Verify dialog is closed
		expect(getModal().props("open")).toBe(false);
	});

	it("shows success toast with view action after restoration", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Open modal and click restore
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "warning"
		);
		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify toast was called with success message and view action
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment restored",
				color: "success",
				actions: expect.arrayContaining([
					expect.objectContaining({
						label: "View",
						variant: "subtle",
						to: `/ferments/${BASE_FAILED_FERMENT.id}`
					})
				])
			})
		);
	});

	it("shows error toast when restoration fails", async () => {
		const errorMessage = "Database connection failed";
		mockUpdate.mockReset();
		mockToastAdd.mockReset();
		mockUpdate.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: BASE_FAILED_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Open modal and click restore
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "warning"
		);
		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error restoring ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
