import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import DueFerments from "~/components/Dashboard/DueFerments.vue";
import { ACTIVE_FERMENT_WITH_END_DATE, BASE_ACTIVE_FERMENT } from "../../../data";

// Mock @tanstack/vue-db with all required exports
vi.mock("@tanstack/vue-db", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		and: vi.fn(),
		eq: vi.fn(),
		useLiveQuery: () => ({
			data: ref([BASE_ACTIVE_FERMENT, ACTIVE_FERMENT_WITH_END_DATE]),
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
			const days = Math.floor((fromDate.getTime() - toDate.getTime()) / (1000 * 60 * 60 * 24));
			return `${Math.abs(days)} days`;
		}
	};
});

describe("components/Dashboard/DueFerments", () => {
	describe("rendering", () => {
		it("renders FermentList component", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.exists()).toBe(true);
		});

		it("passes correct title prop to FermentList", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("title")).toBe("Today");
		});

		it("passes correct icon prop to FermentList", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("icon")).toBe("hugeicons:checkmark-square-01");
		});

		it("passes correct noItemsText prop to FermentList", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("noItemsText")).toBe("No ferments are due today");
		});

		it("passes isLoading from composable to FermentList", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("isLoading")).toBe(false);
		});

		it("passes data from composable as items to FermentList", async () => {
			const wrapper = await mountSuspended(DueFerments, { shallow: true });
			const fermentList = wrapper.findComponent({ name: "FermentList" });
			expect(fermentList.props("items")).toHaveLength(2);
		});
	});

	describe("slot content", () => {
		it("renders UBadge in slot with age information", async () => {
			const wrapper = await mountSuspended(DueFerments);
			const badges = wrapper.findAllComponents({ name: "UBadge" });
			expect(badges.length).toBeGreaterThan(0);
		});

		it("uBadge has neutral color and subtle variant", async () => {
			const wrapper = await mountSuspended(DueFerments);
			const badge = wrapper.findComponent({ name: "UBadge" });
			expect(badge.props("color")).toBe("neutral");
			expect(badge.props("variant")).toBe("subtle");
		});
	});
});
