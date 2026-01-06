import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";
import { UModalStub, UTooltipStub } from "../stubs";

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
		defineShortcuts: vi.fn()
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

describe("components/Forms/NewFermentForm/NewFermentButton", () => {
	const mountOptions = {
		global: {
			stubs: {
				UTooltip: UTooltipStub,
				UModal: UModalStub,
				NewFermentForm: true
			}
		}
	};

	it("renders new ferment button with correct props", async () => {
		const wrapper = await mountSuspended(NewFermentButton, mountOptions);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:plus-sign");
		expect(button.props("label")).toBe("New ferment");
		expect(button.props("variant")).toBe("subtle");
	});

	it("renders UModal for new ferment form with correct props", async () => {
		const wrapper = await mountSuspended(NewFermentButton, mountOptions);
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Create new ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("passes correct props to NewFermentForm", async () => {
		const wrapper = await mountSuspended(NewFermentButton, mountOptions);
		const form = wrapper.findComponent({ name: "NewFermentForm" });
		expect(form.exists()).toBe(true);
	});

	it("opens modal, submits form, and shows success toast", async () => {
		mockInsert.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(NewFermentButton, mountOptions);

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the new ferment button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "NewFermentForm" });
		const submittedFerment = { id: "new-ferment-id", name: "New Ferment", images: [] };
		await form.vm.$emit("submit", submittedFerment);
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify insert was called
		expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
			id: "new-ferment-id",
			name: "New Ferment"
		}));

		// Verify success toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment created",
				color: "success",
				actions: expect.arrayContaining([
					expect.objectContaining({
						label: "View",
						variant: "subtle",
						to: "/ferments/new-ferment-id"
					})
				])
			})
		);

		// Verify modal was closed
		expect(getModal().props("open")).toBe(false);
	});

	it("opens modal and cancels without creating", async () => {
		mockInsert.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(NewFermentButton, mountOptions);

		const getModal = () => wrapper.findComponent({ name: "UModal" });

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit cancel
		const form = wrapper.findComponent({ name: "NewFermentForm" });
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

	it("shows error toast when creation fails", async () => {
		const errorMessage = "Database connection failed";
		mockInsert.mockReset();
		mockToastAdd.mockReset();
		mockInsert.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(NewFermentButton, mountOptions);

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click");
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "NewFermentForm" });
		await form.vm.$emit("submit", { id: "new-ferment-id", name: "New Ferment", images: [] });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error saving ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
