import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, it } from "vitest";
import TableHeader from "~/components/Table/TableHeader.vue";

describe("components/Table/TableHeader", () => {
	afterEach(async () => {
		await flushPromises();
	});

	it("renders with label prop", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column Name",
				isSorted: null
			}
		});
		expect(wrapper.props("label")).toBe("Column Name");
	});

	it("does not render SortButton when isSorted is null", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column",
				isSorted: null
			}
		});
		expect(wrapper.findComponent({ name: "SortButton" }).exists()).toBe(false);
	});

	it("renders SortButton with isSorted false", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column",
				isSorted: false
			}
		});
		const sortButton = wrapper.findComponent({ name: "SortButton" });
		expect(sortButton.exists()).toBe(true);
		expect(sortButton.props("isSorted")).toBe(false);
	});

	it("renders SortButton with ascending state", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column",
				isSorted: "asc"
			}
		});
		const sortButton = wrapper.findComponent({ name: "SortButton" });
		expect(sortButton.props("isSorted")).toBe("asc");
	});

	it("renders SortButton with descending state", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column",
				isSorted: "desc"
			}
		});
		const sortButton = wrapper.findComponent({ name: "SortButton" });
		expect(sortButton.props("isSorted")).toBe("desc");
	});

	it("emits toggleSorting when SortButton emits toggleSorting", async () => {
		const wrapper = await mountSuspended(TableHeader, {
			shallow: true,
			props: {
				label: "Column",
				isSorted: false
			}
		});
		const sortButton = wrapper.findComponent({ name: "SortButton" });
		await sortButton.vm.$emit("toggleSorting", true);
		expect(wrapper.emitted("toggleSorting")).toBeTruthy();
	});
});
