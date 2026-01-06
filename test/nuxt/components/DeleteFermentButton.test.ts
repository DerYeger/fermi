import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import DeleteFermentButton from "~/components/DeleteFermentButton.vue";
import { BASE_ACTIVE_FERMENT } from "../../data";
import { UModalStub } from "../stubs";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockDelete, mockInsert, mockToastAdd, mockRouterPush } = vi.hoisted(() => ({
	mockDelete: vi.fn(),
	mockInsert: vi.fn(),
	mockToastAdd: vi.fn(),
	mockRouterPush: vi.fn()
}));

// Mock the composables
vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		delete: mockDelete,
		insert: mockInsert
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
		useRouter: () => ({
			push: mockRouterPush
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

describe("components/DeleteFermentButton", () => {
	it("renders UButton with delete icon and correct props", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:delete-02");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("error");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Delete label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Delete");

		const hiddenWrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal for confirmation dialog with correct props", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Delete ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("opens confirmation dialog, confirms deletion, and calls delete", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Helper to get the current modal component
		const getModal = () => wrapper.findComponent({ name: "UModal" });

		expect(getModal().props("open")).toBe(false);

		// Click the delete button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the confirm Delete button inside the modal body (variant="subtle", color="error")
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "error"
		);
		expect(confirmButton).toBeDefined();

		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify delete was called with the ferment id
		expect(mockDelete).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT.id);

		// Verify dialog was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens confirmation dialog and cancels without deleting", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Helper to get the current modal component
		const getModal = () => wrapper.findComponent({ name: "UModal" });

		expect(getModal().props("open")).toBe(false);

		// Click the delete button to open the modal
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

		// Verify delete was NOT called
		expect(mockDelete).not.toHaveBeenCalled();

		// Verify no toast was shown
		expect(mockToastAdd).not.toHaveBeenCalled();

		// Verify dialog is closed
		expect(getModal().props("open")).toBe(false);
	});

	it("shows success toast with undo action that restores the ferment", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Open modal and click delete
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "error"
		);
		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify toast was called with undo action
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment deleted",
				color: "success",
				actions: expect.arrayContaining([
					expect.objectContaining({
						label: "Undo",
						variant: "subtle",
						color: "warning",
						onClick: expect.any(Function)
					})
				])
			})
		);

		// Get the undo action and call it
		const toastCall = mockToastAdd.mock.calls[0]?.[0];
		expect(toastCall).toBeDefined();
		const undoAction = toastCall.actions.find((a: { label: string }) => a.label === "Undo");
		expect(undoAction).toBeDefined();

		// Clear mocks to verify the undo behavior
		mockToastAdd.mockClear();

		// Trigger the undo action
		undoAction!.onClick();

		// Verify insert was called with the original ferment
		expect(mockInsert).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT);

		// Verify restoration toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment restored",
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
	});

	it("shows error toast when deletion fails", async () => {
		const errorMessage = "Database connection failed";
		mockDelete.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			global: { stubs: { UModal: UModalStub } }
		});

		// Open modal and click delete
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const confirmButton = buttons.find((btn) =>
			btn.props("variant") === "subtle" && btn.props("color") === "error"
		);
		await confirmButton!.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error deleting ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
