import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import OverdueFerments from "~/components/Dashboard/OverdueFerments.vue";
import { OVERDUE_FERMENT } from "../../../data";

const secondOverdueFerment = { ...OVERDUE_FERMENT, id: "overdue-2", name: "Second Overdue" };

// Mock @tanstack/vue-db with all required exports
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		and: vi.fn(),
		eq: vi.fn(),
		lt: vi.fn(),
		useLiveQuery: () => ({
			data: ref([OVERDUE_FERMENT, secondOverdueFerment]),
			isLoading: ref(false)
		}),
		createCollection: vi.fn(() => ({}))
	};
});

vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {},
		today: ref("2024-01-15"),
		formatTimeSince: (from: string, to: string) => {
			const fromDate = new Date(from);
			const toDate = new Date(to);
			const days = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));
			return `${Math.abs(days)} days`;
		}
	};
});

describe("components/Dashboard/OverdueFerments", () => {
	describe("rendering", () => {
		it("renders FermentList component", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.exists()).toBe(true);
		});

		it("passes correct title prop to FermentList", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("title")).toBe("Overdue");
		});

		it("passes correct icon prop to FermentList", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("icon")).toBe("hugeicons:alert-02");
		});

		it("passes correct noItemsText prop to FermentList", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("noItemsText")).toBe("No overdue ferments");
		});

		it("passes isLoading from composable to FermentList", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("isLoading")).toBe(false);
		});

		it("passes data from composable as items to FermentList", async () => {
			const wrapper = await mountSuspended(OverdueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("items")).toHaveLength(2);
		});
	});

	describe("slot content", () => {
		it("renders two UBadges per overdue ferment (age and overdue)", async () => {
			const wrapper = await mountSuspended(OverdueFerments);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			// 2 ferments × 2 badges each = 4 badges
			expect(badges.length).toBe(4);
		});

		it("renders age badge with neutral color", async () => {
			const wrapper = await mountSuspended(OverdueFerments);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const neutralBadges = badges.filter((b) => b.props("color") === "neutral");
			expect(neutralBadges.length).toBeGreaterThan(0);
		});

		it("renders overdue badge with warning color", async () => {
			const wrapper = await mountSuspended(OverdueFerments);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			const warningBadges = badges.filter((b) => b.props("color") === "warning");
			expect(warningBadges.length).toBeGreaterThan(0);
		});

		it("all badges have subtle variant", async () => {
			const wrapper = await mountSuspended(OverdueFerments);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			badges.forEach((badge) => {
				expect(badge.props("variant")).toBe("subtle");
			});
		});
	});
});
