import type { ActiveFerment } from "~/types/ferment";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FermentCard from "~/components/FermentCard.vue";
import {
	ACTIVE_FERMENT_MANY_INGREDIENTS,
	ACTIVE_FERMENT_WITH_END_DATE,
	BASE_ACTIVE_FERMENT,
	IMAGES,
	OVERDUE_FERMENT
} from "../../data";

// Use vi.hoisted to ensure mocks are available during vi.mock execution
const { mockNavigateTo } = vi.hoisted(() => ({
	mockNavigateTo: vi.fn()
}));

// Mock #imports for auto-imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		navigateTo: mockNavigateTo,
		getISODate: () => "2024-01-15",
		getISODatetime: () => "2024-01-15T12:00:00Z",
		isFermentOverdue: (ferment: { endDate: string | null }) => {
			if (!ferment.endDate) return false;
			return ferment.endDate < "2024-01-15";
		}
	};
});

vi.mock("~/composables/collections", () => ({
	FermentCollection: {
		update: vi.fn()
	}
}));

// Mock button components to be findable by name
vi.mock("~/components/Forms/EditFermentForm/EditFermentButton.vue", () => ({
	default: {
		name: "EditFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Edit</button>"
	}
}));

vi.mock("~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue", () => ({
	default: {
		name: "ArchiveFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Archive</button>"
	}
}));

vi.mock("~/components/Forms/FailFermentForm/FailFermentButton.vue", () => ({
	default: {
		name: "FailFermentButton",
		props: ["ferment", "hideLabel"],
		template: "<button>Fail</button>"
	}
}));

describe("components/FermentCard", () => {
	const fermentWithImage: ActiveFerment = {
		...BASE_ACTIVE_FERMENT,
		images: [IMAGES.day1]
	};

	it("renders CardHeader with ferment name", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe(BASE_ACTIVE_FERMENT.name);
	});

	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("displays placeholder icon when no images exist", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const icon = wrapper.findComponent({ name: "UIcon" });
		expect(icon.exists()).toBe(true);
		expect(icon.props("name")).toBe("hugeicons:iconjar");
	});

	it("displays image when images exist", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: fermentWithImage }
		});
		const img = wrapper.find("img");
		expect(img.exists()).toBe(true);
		expect(img.attributes("src")).toBe(IMAGES.day1.base64);
		expect(img.attributes("alt")).toBe(fermentWithImage.name);
	});

	it("displays salt ratio", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		expect(wrapper.text()).toContain("salt");
	});

	it("displays start date", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		expect(wrapper.text()).toContain("Started");
	});

	it("displays end date when set", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: ACTIVE_FERMENT_WITH_END_DATE }
		});
		expect(wrapper.text()).toContain("Ends");
	});

	it("displays 'No end date' when endDate is null", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		expect(wrapper.text()).toContain("No end date");
	});

	it("displays overdue badge for overdue ferments", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: OVERDUE_FERMENT }
		});
		const badges = wrapper.findAllComponents({ name: "UBadge" });
		const overdueBadge = badges.find((badge) => badge.props("color") === "warning");
		expect(overdueBadge).toBeDefined();
	});

	it("renders IngredientBadges when ingredients exist", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: ACTIVE_FERMENT_MANY_INGREDIENTS }
		});
		const ingredientBadges = wrapper.findComponent({ name: "IngredientBadges" });
		expect(ingredientBadges.exists()).toBe(true);
		expect(ingredientBadges.props("ingredients")).toHaveLength(ACTIVE_FERMENT_MANY_INGREDIENTS.ingredients.length);
	});

	it("does not render IngredientBadges when no ingredients", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const ingredientBadges = wrapper.findComponent({ name: "IngredientBadges" });
		expect(ingredientBadges.exists()).toBe(false);
	});

	it("renders FavoriteFermentButton", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "FavoriteFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("ferment")).toEqual(BASE_ACTIVE_FERMENT);
	});

	it("renders EditFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "EditFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("hideLabel")).toBeDefined();
	});

	it("renders DuplicateFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "DuplicateFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("hideLabel")).toBeDefined();
	});

	it("renders ArchiveFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "ArchiveFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("hideLabel")).toBeDefined();
	});

	it("renders FailFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "FailFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("hideLabel")).toBeDefined();
	});

	it("renders DeleteFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const button = wrapper.findComponent({ name: "DeleteFermentButton" });
		expect(button.exists()).toBe(true);
		expect(button.props("hideLabel")).toBeDefined();
	});

	it("has cursor-pointer class for navigation", async () => {
		const wrapper = await mountSuspended(FermentCard, {
			props: { ferment: BASE_ACTIVE_FERMENT }
		});
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.classes()).toContain("cursor-pointer");
	});
});
