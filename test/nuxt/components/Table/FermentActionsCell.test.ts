import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FermentActionsCell from "~/components/Table/FermentActionsCell.vue";

// Mock all button components
vi.mock("~/components/FavoriteFermentButton.vue", () => ({
	default: {
		name: "FavoriteFermentButton",
		props: ["ferment"],
		template: "<button>Favorite</button>"
	}
}));

vi.mock("~/components/Forms/EditFermentForm/EditFermentButton.vue", () => ({
	default: {
		name: "EditFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Edit</button>"
	}
}));

vi.mock("~/components/DuplicateFermentButton.vue", () => ({
	default: {
		name: "DuplicateFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Duplicate</button>"
	}
}));

vi.mock("~/components/UnarchiveFermentButton.vue", () => ({
	default: {
		name: "UnarchiveFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Unarchive</button>"
	}
}));

vi.mock("~/components/UnfailFermentButton.vue", () => ({
	default: {
		name: "UnfailFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Unfail</button>"
	}
}));

vi.mock("~/components/DeleteFermentButton.vue", () => ({
	default: {
		name: "DeleteFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Delete</button>"
	}
}));

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		navigateTo: vi.fn()
	};
});

describe("components/Table/FermentActionsCell", () => {
	const completedFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Test Ferment",
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
		overall: { stars: null, notes: "" },
		flavor: { stars: null, notes: "" },
		texture: { stars: null, notes: "" },
		smell: { stars: null, notes: "" },
		process: { stars: null, notes: "" }
	};

	const failedFerment = {
		version: 1 as const,
		id: "test-2",
		name: "Test Ferment",
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
		reason: "Got moldy"
	};

	it("renders FavoriteFermentButton component", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: completedFerment }
		});
		const favoriteBtn = wrapper.findComponent({ name: "FavoriteFermentButton" });
		expect(favoriteBtn.exists()).toBe(true);
		expect(favoriteBtn.props("ferment")).toBe(completedFerment);
	});

	it("renders EditFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: completedFerment }
		});
		const editBtn = wrapper.findComponent({ name: "EditFermentButton" });
		expect(editBtn.exists()).toBe(true);
		expect(editBtn.props("hideLabel")).toBeDefined();
	});

	it("renders DuplicateFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: completedFerment }
		});
		const dupBtn = wrapper.findComponent({ name: "DuplicateFermentButton" });
		expect(dupBtn.exists()).toBe(true);
		expect(dupBtn.props("hideLabel")).toBeDefined();
	});

	it("renders DeleteFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: completedFerment }
		});
		const deleteBtn = wrapper.findComponent({ name: "DeleteFermentButton" });
		expect(deleteBtn.exists()).toBe(true);
		expect(deleteBtn.props("hideLabel")).toBeDefined();
	});

	it("renders UnarchiveFermentButton for completed ferment", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: completedFerment }
		});
		const unarchiveBtn = wrapper.findComponent({ name: "UnarchiveFermentButton" });
		expect(unarchiveBtn.exists()).toBe(true);
		const unfailBtn = wrapper.findComponent({ name: "UnfailFermentButton" });
		expect(unfailBtn.exists()).toBe(false);
	});

	it("renders UnfailFermentButton for failed ferment", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			props: { ferment: failedFerment }
		});
		const unfailBtn = wrapper.findComponent({ name: "UnfailFermentButton" });
		expect(unfailBtn.exists()).toBe(true);
		const unarchiveBtn = wrapper.findComponent({ name: "UnarchiveFermentButton" });
		expect(unarchiveBtn.exists()).toBe(false);
	});
});
