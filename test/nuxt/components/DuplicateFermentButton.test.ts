import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DuplicateFermentButton from "~/components/DuplicateFermentButton.vue";

// Mock components
vi.mock("~/components/Forms/EditFermentForm/EditActiveFermentForm.vue", () => ({
	default: {
		name: "EditActiveFermentForm",
		props: ["ferment", "submitLabel"],
		template: "<div>Active Form</div>"
	}
}));

vi.mock("~/components/Forms/EditFermentForm/EditCompletedFermentForm.vue", () => ({
	default: {
		name: "EditCompletedFermentForm",
		props: ["ferment", "submitLabel"],
		template: "<div>Completed Form</div>"
	}
}));

vi.mock("~/components/Forms/EditFermentForm/EditFailedFermentForm.vue", () => ({
	default: {
		name: "EditFailedFermentForm",
		props: ["ferment", "submitLabel"],
		template: "<div>Failed Form</div>"
	}
}));

// Mock FermentCollection and other imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			insert: vi.fn()
		},
		getISODatetime: () => "2024-01-15T12:00:00Z",
		createId: () => "new-id-123",
		useToast: () => ({
			add: vi.fn()
		})
	};
});

describe("components/DuplicateFermentButton", () => {
	const activeFerment = {
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

	it("renders UButton with copy icon and ghost variant", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: activeFerment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("icon")).toBe("hugeicons:copy-01");
		expect(button.props("variant")).toBe("ghost");
	});

	it("shows Duplicate label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: activeFerment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Duplicate");

		const hiddenWrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: activeFerment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("renders UModal for duplicate dialog", async () => {
		const wrapper = await mountSuspended(DuplicateFermentButton, {
			props: { ferment: activeFerment }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Duplicate ferment");
	});
});
