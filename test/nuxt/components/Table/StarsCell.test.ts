import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import StarsCell from "~/components/Table/StarsCell.vue";

describe("components/Table/StarsCell", () => {
	it("renders 5 star icons", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: 3 }
		});
		const icons = wrapper.findAll(".iconify");
		expect(icons).toHaveLength(5);
	});

	it("highlights correct number of stars", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: 3 }
		});
		const activeStars = wrapper.findAll(".text-yellow-500");
		expect(activeStars).toHaveLength(3);
	});

	it("shows all stars muted when stars is null", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: null }
		});
		const activeStars = wrapper.findAll(".text-yellow-500");
		expect(activeStars).toHaveLength(0);
	});

	it("shows all stars muted when stars is 0", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: 0 }
		});
		const activeStars = wrapper.findAll(".text-yellow-500");
		expect(activeStars).toHaveLength(0);
	});

	it("highlights all 5 stars when stars is 5", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: 5 }
		});
		const activeStars = wrapper.findAll(".text-yellow-500");
		expect(activeStars).toHaveLength(5);
	});

	it("highlights 1 star when stars is 1", async () => {
		const wrapper = await mountSuspended(StarsCell, {
			props: { stars: 1 }
		});
		const activeStars = wrapper.findAll(".text-yellow-500");
		expect(activeStars).toHaveLength(1);
	});
});
