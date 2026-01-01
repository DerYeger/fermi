import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import SortButton from "~/components/Table/SortButton.vue";

describe("components/Table/SortButton", () => {
	it("renders with unsorted state", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:arrow-up-down");
	});

	it("renders with ascending sort", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: "asc" }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:sort-by-up-02");
	});

	it("renders with descending sort", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: "desc" }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:sort-by-down-02");
	});

	it("emits toggleSorting with false when currently unsorted", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: false }
		});
		await wrapper.find("button").trigger("click");
		expect(wrapper.emitted("toggleSorting")).toBeTruthy();
		expect(wrapper.emitted("toggleSorting")![0]).toEqual([false]);
	});

	it("emits toggleSorting with true when currently ascending", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: "asc" }
		});
		await wrapper.find("button").trigger("click");
		expect(wrapper.emitted("toggleSorting")![0]).toEqual([true]);
	});

	it("emits toggleSorting with false when currently descending", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: "desc" }
		});
		await wrapper.find("button").trigger("click");
		expect(wrapper.emitted("toggleSorting")![0]).toEqual([false]);
	});

	it("uses primary color when sorted", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: "asc" }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("primary");
	});

	it("uses neutral color when unsorted", async () => {
		const wrapper = await mountSuspended(SortButton, {
			props: { isSorted: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("color")).toBe("neutral");
	});
});
