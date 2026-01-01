import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import FavoriteFermentButton from "~/components/FavoriteFermentButton.vue";

// Mock FermentCollection
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			update: vi.fn()
		},
		getISODatetime: () => "2024-01-15T12:00:00Z"
	};
});

describe("components/FavoriteFermentButton", () => {
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

	const favoritedFerment = {
		...ferment,
		isFavorite: true
	};

	it("renders favorite button with heart icon", async () => {
		const wrapper = await mountSuspended(FavoriteFermentButton, {
			props: { ferment }
		});
		expect(wrapper.find("button").exists()).toBe(true);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:favourite");
	});

	it("uses neutral color when not favorited and error color when favorited", async () => {
		const wrapper = await mountSuspended(FavoriteFermentButton, {
			props: { ferment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("neutral");

		const favWrapper = await mountSuspended(FavoriteFermentButton, {
			props: { ferment: favoritedFerment }
		});
		const favButton = favWrapper.findComponent({ name: "UButton" });
		expect(favButton.props("color")).toBe("error");
	});
});
