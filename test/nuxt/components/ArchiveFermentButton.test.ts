import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";
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

describe("components/ArchiveFermentButton", () => {
	const mountOptions = {
		global: {
			stubs: {
				UModal: UModalStub,
				ArchiveForm: true
			}
		}
	};

	it("renders complete button with correct props", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:archive-03");
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
		expect(button.props("size")).toBe("sm");
	});

	it("shows Complete label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: false },
			...mountOptions
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Complete");

		const hiddenWrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT, hideLabel: true },
			...mountOptions
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal with correct props", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Complete ferment");
		expect(modal.props("open")).toBe(false);
	});

	it("passes correct props to ArchiveForm", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});
		const form = wrapper.findComponent({ name: "ArchiveForm" });
		expect(form.exists()).toBe(true);
		expect(form.props("ferment")).toEqual(BASE_ACTIVE_FERMENT);
	});

	it("opens modal, submits form, and shows success toast with view action", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		const getModal = () => wrapper.findComponent({ name: "UModal" });
		expect(getModal().props("open")).toBe(false);

		// Click the complete button to open the modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		expect(getModal().props("open")).toBe(true);

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "ArchiveForm" });
		const completedFerment = {
			...BASE_ACTIVE_FERMENT,
			state: "completed",
			endDate: "2024-01-15",
			images: [],
			overall: { stars: 4, notes: "" },
			flavor: { stars: 4, notes: "" },
			texture: { stars: 4, notes: "" },
			smell: { stars: 4, notes: "" },
			process: { stars: 4, notes: "" }
		};
		await form.vm.$emit("submit", completedFerment);
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify update was called
		expect(mockUpdate).toHaveBeenCalledWith(BASE_ACTIVE_FERMENT.id, expect.any(Function));

		// Verify success toast was shown with view action
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Ferment completed",
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

	it("opens modal and cancels without completing", async () => {
		mockUpdate.mockReset();
		mockToastAdd.mockReset();

		const wrapper = await mountSuspended(ArchiveFermentButton, {
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
		const form = wrapper.findComponent({ name: "ArchiveForm" });
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

	it("shows error toast when completion fails", async () => {
		const errorMessage = "Database connection failed";
		mockUpdate.mockReset();
		mockToastAdd.mockReset();
		mockUpdate.mockImplementationOnce(() => {
			throw new Error(errorMessage);
		});

		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: BASE_ACTIVE_FERMENT },
			...mountOptions
		});

		// Click to open modal
		const triggerButton = wrapper.findComponent({ name: "UButton" });
		await triggerButton.vm.$emit("click", { stopPropagation: () => {} });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Find the form and emit submit
		const form = wrapper.findComponent({ name: "ArchiveForm" });
		await form.vm.$emit("submit", { ...BASE_ACTIVE_FERMENT, state: "completed", images: [] });
		await wrapper.vm.$nextTick();
		await flushPromises();

		// Verify error toast was shown
		expect(mockToastAdd).toHaveBeenCalledWith(
			expect.objectContaining({
				title: "Error completing ferment",
				description: `Error: ${errorMessage}`,
				color: "error"
			})
		);
	});
});
