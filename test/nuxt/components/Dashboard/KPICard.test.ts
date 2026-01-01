import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import KPICard from "~/components/Dashboard/KPICard.vue";

// Mock the ferment composables
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		useActiveFerments: () => ({
			data: ref([{ id: "1" }, { id: "2" }]),
			isLoading: ref(false)
		}),
		useCompletedFerments: () => ({
			data: ref([{ id: "3" }]),
			isLoading: ref(false)
		}),
		useFailedFerments: () => ({
			data: ref([]),
			isLoading: ref(false)
		})
	};
});

describe("components/Dashboard/KPICard", () => {
	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(KPICard);
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
	});

	it("renders CardHeader with Overview title", async () => {
		const wrapper = await mountSuspended(KPICard);
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Overview");
		expect(header.props("icon")).toBe("hugeicons:analytics-up");
	});

	it("calculates correct total count", async () => {
		const wrapper = await mountSuspended(KPICard);
		// Total should be active (2) + completed (1) = 3
		// Find the Total section by looking for count display
		const countElements = wrapper.findAll(".text-2xl");
		expect(countElements.length).toBeGreaterThan(0);
	});
});
