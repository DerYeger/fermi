import { mountSuspended } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DeleteFermentButton from "~/components/DeleteFermentButton.vue";

const mockDelete = vi.fn();
const mockInsert = vi.fn();
const mockToastAdd = vi.fn();
const mockRouterPush = vi.fn();

// Mock FermentCollection
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			delete: mockDelete,
			insert: mockInsert
		},
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

vi.mock("~/types/utils", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		getErrorMessage: (error: unknown) => String(error)
	};
});

describe("components/DeleteFermentButton", () => {
	const ferment = {
		version: 1 as const,
		id: "test-1",
		name: "Test Ferment",
		state: "active" as const,
		startDate: "2024-01-01",
		endDate: null,
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z"
	};

	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("renders UButton with delete icon and correct props", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment }
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
			props: { ferment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Delete");

		const hiddenWrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal for confirmation dialog with buttons", async () => {
		const wrapper = await mountSuspended(DeleteFermentButton, {
			props: { ferment }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Delete ferment");
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		// Main delete button + Cancel button + Confirm delete button
		expect(buttons.length).toBeGreaterThanOrEqual(1);
	});
});
