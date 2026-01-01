import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import EditFermentButton from "~/components/Forms/EditFermentForm/EditFermentButton.vue";

// Mock FermentCollection and related functions
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			update: vi.fn()
		},
		getISODatetime: () => "2024-01-15T12:00:00Z",
		useToast: () => ({
			add: vi.fn()
		}),
		useRoute: () => ({
			name: "ferments",
			params: {}
		}),
		useRouter: () => ({
			push: vi.fn()
		})
	};
});

describe("components/EditFermentButton", () => {
	const activeFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Active Ferment",
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

	const completedFerment = {
		version: 1 as const,
		id: "test-2",
		name: "Completed Ferment",
		state: "completed" as const,
		startDate: "2024-01-01",
		endDate: "2024-01-15",
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		overall: { stars: 4, notes: "" },
		flavor: { stars: 4, notes: "" },
		texture: { stars: 4, notes: "" },
		smell: { stars: 4, notes: "" },
		process: { stars: 4, notes: "" }
	};

	const failedFerment = {
		version: 1 as const,
		id: "test-3",
		name: "Failed Ferment",
		state: "failed" as const,
		startDate: "2024-01-01",
		endDate: "2024-01-15",
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		reason: "Mold appeared"
	};

	it("renders edit button for all ferment states", async () => {
		const activeWrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: activeFerment }
		});
		expect(activeWrapper.find("button").exists()).toBe(true);

		const completedWrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: completedFerment }
		});
		expect(completedWrapper.find("button").exists()).toBe(true);

		const failedWrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: failedFerment }
		});
		expect(failedWrapper.find("button").exists()).toBe(true);
	});

	it("renders edit icon with ghost variant", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: activeFerment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:edit-03");
		expect(button.props("variant")).toBe("ghost");
	});

	it("shows Edit label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: activeFerment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Edit");

		const hiddenWrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: activeFerment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("has a modal for edit form", async () => {
		const wrapper = await mountSuspended(EditFermentButton, {
			props: { ferment: activeFerment }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Edit ferment");
	});
});
