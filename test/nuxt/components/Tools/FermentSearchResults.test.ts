import type { FermentSearchToolInvocation } from "~/composables/chatTools";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FermentSearchResults from "~/components/Tools/FermentSearchResults.vue";

describe("components/Tools/FermentSearchResults", () => {
	describe("with zero results", () => {
		it("renders nothing when output is undefined", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: undefined
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			expect(wrapper.find("div").exists()).toBe(false);
		});

		it("renders nothing when ferments array is empty", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: { ferments: [], total: 0 }
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			expect(wrapper.find("div").exists()).toBe(false);
		});

		it("renders nothing when ferments array is undefined", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: { ferments: undefined, total: 0 } as never
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			expect(wrapper.find("div").exists()).toBe(false);
		});
	});

	describe("with results", () => {
		it("renders buttons for all three ferment states with correct colors", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Active Kimchi", state: "active", startDate: "2024-01-01", endDate: null },
						{ id: "ferment-2", name: "Completed Sauerkraut", state: "completed", startDate: "2024-01-01", endDate: "2024-01-15" },
						{ id: "ferment-3", name: "Failed Kombucha", state: "failed", startDate: "2024-01-01", endDate: "2024-01-10" }
					],
					total: 3
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const buttons = wrapper.findAllComponents({ name: "UButton" });
			expect(buttons).toHaveLength(3);
			expect(buttons[0]!.props("color")).toBe("primary");
			expect(buttons[1]!.props("color")).toBe("warning");
			expect(buttons[2]!.props("color")).toBe("error");
		});

		it("renders correct button labels for ferments", async () => {
			const FERMENT_NAMES = ["Active Kimchi", "Completed Sauerkraut", "Failed Kombucha"];
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: FERMENT_NAMES[0]!, state: "active", startDate: "2024-01-01", endDate: null },
						{ id: "ferment-2", name: FERMENT_NAMES[1]!, state: "completed", startDate: "2024-01-01", endDate: "2024-01-15" },
						{ id: "ferment-3", name: FERMENT_NAMES[2]!, state: "failed", startDate: "2024-01-01", endDate: "2024-01-10" }
					],
					total: 3
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const buttons = wrapper.findAllComponents({ name: "UButton" });
			expect(buttons[0]!.text()).toBe(FERMENT_NAMES[0]);
			expect(buttons[1]!.text()).toBe(FERMENT_NAMES[1]);
			expect(buttons[2]!.text()).toBe(FERMENT_NAMES[2]);
		});

		it("applies correct button size and variant", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Kimchi", state: "active", startDate: "2024-01-01", endDate: null }
					],
					total: 1
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("size")).toBe("xs");
			expect(button.props("variant")).toBe("subtle");
		});
	});

	describe("button colors by state", () => {
		it("renders primary color for active ferments", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Active Ferment", state: "active", startDate: "2024-01-01", endDate: null }
					],
					total: 1
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("primary");
		});

		it("renders warning color for completed ferments", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Completed Ferment", state: "completed", startDate: "2024-01-01", endDate: "2024-01-15" }
					],
					total: 1
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("warning");
		});

		it("renders error color for failed ferments", async () => {
			const part: Partial<FermentSearchToolInvocation> & { type: "tool-fermentSearch" } = {
				type: "tool-fermentSearch",
				output: {
					ferments: [
						{ id: "ferment-1", name: "Failed Ferment", state: "failed", startDate: "2024-01-01", endDate: "2024-01-10" }
					],
					total: 1
				}
			};

			const wrapper = await mountSuspended(FermentSearchResults, {
				props: { part: part as FermentSearchToolInvocation }
			});

			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.props("color")).toBe("error");
		});
	});
});
