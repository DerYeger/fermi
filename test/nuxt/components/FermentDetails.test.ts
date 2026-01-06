import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FermentDetails from "~/components/FermentDetails.vue";
import {
	ACTIVE_FERMENT_WITH_DATA,
	BASE_ACTIVE_FERMENT,
	BASE_COMPLETED_FERMENT,
	BASE_FAILED_FERMENT,
	FAILED_FERMENT_NO_REASON,
	OVERDUE_FERMENT
} from "../../data";

// Mock #imports for auto-imports
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		getISODate: () => "2024-01-20",
		getISODatetime: () => "2024-01-20T12:00:00Z",
		isFermentOverdue: (ferment: { endDate: string | null }) => {
			if (!ferment.endDate) return false;
			return ferment.endDate < "2024-01-20";
		}
	};
});

// Also mock the composable directly for internal function calls
vi.mock("~/composables/time", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		getISODate: () => "2024-01-20",
		getISODatetime: () => "2024-01-20T12:00:00Z",
		isFermentOverdue: (ferment: { endDate: string | null }) => {
			if (!ferment.endDate) return false;
			return ferment.endDate < "2024-01-20";
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

describe("components/FermentDetails", () => {
	// Extended ferment variants for specific tests
	const activeFermentNoEndDate = {
		...BASE_ACTIVE_FERMENT,
		id: "test-active-no-end",
		endDate: null
	};

	// Active ferment with end date in the future (relative to its start)
	// Note: The mocked getISODate returns "2024-01-20", so a ferment with
	// endDate "2024-02-01" should show remaining time (not overdue)
	const activeFermentFuture = {
		...BASE_ACTIVE_FERMENT,
		id: "test-active-future",
		endDate: "2024-02-15" // Well in the future
	};

	// ==================== Header Tests ====================

	describe("header", () => {
		it("renders ferment name when withHeader is true", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA, withHeader: true }
			});
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.name);
		});

		it("does not render header when withHeader is false", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA, withHeader: false }
			});
			const headerDiv = wrapper.find(".text-2xl.font-bold");
			expect(headerDiv.exists()).toBe(false);
		});

		it("renders header by default (withHeader defaults to true)", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			const headerDiv = wrapper.find(".text-2xl.font-bold");
			expect(headerDiv.exists()).toBe(true);
		});
	});

	// ==================== Active Ferment Tests ====================

	describe("active ferment", () => {
		it("renders all action buttons for active ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.findComponent({ name: "FavoriteFermentButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "EditFermentButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "DuplicateFermentButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "ArchiveFermentButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "FailFermentButton" }).exists()).toBe(true);
			expect(wrapper.findComponent({ name: "DeleteFermentButton" }).exists()).toBe(true);
		});

		it("does not render UnarchiveFermentButton for active ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.findComponent({ name: "UnarchiveFermentButton" }).exists()).toBe(false);
		});

		it("does not render UnfailFermentButton for active ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.findComponent({ name: "UnfailFermentButton" }).exists()).toBe(false);
		});

		it("displays remaining time when active with future end date", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: activeFermentFuture }
			});
			expect(wrapper.text()).toContain("Remaining");
		});

		it("displays overdue badge for overdue active ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: OVERDUE_FERMENT }
			});
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const overdueBadge = badges.find((badge) => badge.props("color") === "warning");
			expect(overdueBadge).toBeDefined();
		});

		it("does not display remaining time for overdue ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: OVERDUE_FERMENT }
			});
			// Remaining section should not exist for overdue ferments
			const remainingLabel = wrapper.findAll(".text-muted").filter((el) => el.text() === "Remaining");
			expect(remainingLabel).toHaveLength(0);
		});

		it("does not display ratings cards for active ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.findComponent({ name: "RatingsCard" }).exists()).toBe(false);
		});
	});

	// ==================== Completed Ferment Tests ====================

	describe("completed ferment", () => {
		it("renders UnarchiveFermentButton for completed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "UnarchiveFermentButton" }).exists()).toBe(true);
		});

		it("does not render ArchiveFermentButton for completed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "ArchiveFermentButton" }).exists()).toBe(false);
		});

		it("does not render FailFermentButton for completed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "FailFermentButton" }).exists()).toBe(false);
		});

		it("displays completed badge", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const completedBadge = badges.find((badge) =>
				badge.props("color") === "success" && badge.props("variant") === "subtle"
			);
			expect(completedBadge).toBeDefined();
		});

		it("renders all five RatingsCard components", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			const ratingsCards = wrapper.findAllComponents({ name: "RatingsCard" });
			expect(ratingsCards).toHaveLength(5);
		});

		it("renders RatingsCard with correct props for each category", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			const ratingsCards = wrapper.findAllComponents({ name: "RatingsCard" });

			const titles = ratingsCards.map((card) => card.props("title"));
			expect(titles).toContain("Overall");
			expect(titles).toContain("Flavor");
			expect(titles).toContain("Texture");
			expect(titles).toContain("Smell");
			expect(titles).toContain("Process");
		});
	});

	// ==================== Failed Ferment Tests ====================

	describe("failed ferment", () => {
		it("renders UnfailFermentButton for failed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "UnfailFermentButton" }).exists()).toBe(true);
		});

		it("does not render ArchiveFermentButton for failed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "ArchiveFermentButton" }).exists()).toBe(false);
		});

		it("does not render FailFermentButton for failed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "FailFermentButton" }).exists()).toBe(false);
		});

		it("displays failed badge", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const failedBadge = badges.find((badge) =>
				badge.props("color") === "error" && badge.props("variant") === "subtle"
			);
			expect(failedBadge).toBeDefined();
		});

		it("renders Reason card with failure reason", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.text()).toContain("Reason");
			expect(wrapper.text()).toContain(BASE_FAILED_FERMENT.reason);
		});

		it("displays 'No reason' when reason is empty", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: FAILED_FERMENT_NO_REASON }
			});
			expect(wrapper.text()).toContain("No reason");
		});

		it("does not render ratings cards for failed ferment", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.findComponent({ name: "RatingsCard" }).exists()).toBe(false);
		});
	});

	// ==================== Details Card Tests ====================

	describe("details card", () => {
		it("displays container when set", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Container");
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.container);
		});

		it("does not display container section when null", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			const containerLabels = wrapper.findAll(".text-muted").filter((el) => el.text() === "Container");
			expect(containerLabels).toHaveLength(0);
		});

		it("displays salt ratio", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Salt Ratio");
		});

		it("displays duration", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Duration");
		});

		it("displays start date", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Start Date");
		});

		it("displays end date when set", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("End Date");
		});

		it("does not display end date section when null", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: activeFermentNoEndDate }
			});
			const endDateLabels = wrapper.findAll(".text-muted").filter((el) => el.text() === "End Date");
			expect(endDateLabels).toHaveLength(0);
		});

		it("displays created timestamp", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Created");
		});

		it("displays last updated timestamp", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Last Updated");
		});
	});

	// ==================== Images Tests ====================

	describe("images", () => {
		it("renders UCarousel when images exist", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			const carousel = wrapper.findComponent({ name: "UCarousel" });
			expect(carousel.exists()).toBe(true);
		});

		it("renders placeholder icon when no images", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			const icons = wrapper.findAllComponents({ name: "UIcon" });
			const placeholderIcon = icons.find((icon) => icon.props("name") === "hugeicons:iconjar");
			expect(placeholderIcon).toBeDefined();
		});

		it("does not render UCarousel when no images", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_COMPLETED_FERMENT }
			});
			const carousel = wrapper.findComponent({ name: "UCarousel" });
			expect(carousel.exists()).toBe(false);
		});
	});

	// ==================== Ingredients Tests ====================

	describe("ingredients", () => {
		it("renders ingredient list with names and quantities", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain("Ingredients");
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.ingredients[0]!.name);
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.ingredients[1]!.name);
		});

		it("displays 'No ingredients' when list is empty", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.text()).toContain("No ingredients");
		});

		it("renders CardHeader for ingredients section", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			const headers = wrapper.findAllComponents({ name: "CardHeader" });
			const ingredientsHeader = headers.find((h) => h.props("title") === "Ingredients");
			expect(ingredientsHeader).toBeDefined();
		});
	});

	// ==================== Notes Tests ====================

	describe("notes", () => {
		it("renders notes when present", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			expect(wrapper.text()).toContain(ACTIVE_FERMENT_WITH_DATA.notes);
		});

		it("displays 'No notes' when notes is empty", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: BASE_FAILED_FERMENT }
			});
			expect(wrapper.text()).toContain("No notes");
		});

		it("renders CardHeader for notes section", async () => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment: ACTIVE_FERMENT_WITH_DATA }
			});
			const headers = wrapper.findAllComponents({ name: "CardHeader" });
			const notesHeader = headers.find((h) => h.props("title") === "Notes");
			expect(notesHeader).toBeDefined();
		});
	});

	// ==================== Common Action Buttons Tests ====================

	describe("common action buttons", () => {
		it.each([
			["active", ACTIVE_FERMENT_WITH_DATA],
			["completed", BASE_COMPLETED_FERMENT],
			["failed", BASE_FAILED_FERMENT]
		] as const)("renders FavoriteFermentButton for %s ferment", async (_, ferment) => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment }
			});
			const button = wrapper.findComponent({ name: "FavoriteFermentButton" });
			expect(button.exists()).toBe(true);
			expect(button.props("ferment")).toEqual(ferment);
		});

		it.each([
			["active", ACTIVE_FERMENT_WITH_DATA],
			["completed", BASE_COMPLETED_FERMENT],
			["failed", BASE_FAILED_FERMENT]
		] as const)("renders EditFermentButton for %s ferment", async (_, ferment) => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment }
			});
			expect(wrapper.findComponent({ name: "EditFermentButton" }).exists()).toBe(true);
		});

		it.each([
			["active", ACTIVE_FERMENT_WITH_DATA],
			["completed", BASE_COMPLETED_FERMENT],
			["failed", BASE_FAILED_FERMENT]
		] as const)("renders DuplicateFermentButton for %s ferment", async (_, ferment) => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment }
			});
			expect(wrapper.findComponent({ name: "DuplicateFermentButton" }).exists()).toBe(true);
		});

		it.each([
			["active", ACTIVE_FERMENT_WITH_DATA],
			["completed", BASE_COMPLETED_FERMENT],
			["failed", BASE_FAILED_FERMENT]
		] as const)("renders DeleteFermentButton for %s ferment", async (_, ferment) => {
			const wrapper = await mountSuspended(FermentDetails, {
				props: { ferment }
			});
			expect(wrapper.findComponent({ name: "DeleteFermentButton" }).exists()).toBe(true);
		});
	});
});
