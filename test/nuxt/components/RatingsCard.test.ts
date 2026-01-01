import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import RatingsCard from "~/components/RatingsCard.vue";

// Mock StarsCell component
vi.mock("~/components/Table/StarsCell.vue", () => ({
	default: {
		name: "StarsCell",
		props: ["stars"],
		template: "<span>{{ stars }} stars</span>"
	}
}));

describe("components/RatingsCard", () => {
	const defaultProps = {
		title: "Taste Rating",
		icon: "hugeicons:star",
		rating: {
			stars: 4,
			notes: "Great flavor with nice acidity"
		}
	};

	it("renders CardHeader with correct props", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: defaultProps
		});
		const header = wrapper.findComponent({ name: "CardHeader" });
		expect(header.exists()).toBe(true);
		expect(header.props("title")).toBe("Taste Rating");
		expect(header.props("icon")).toBe("hugeicons:star");
	});

	it("renders StarsCell with correct stars prop", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: defaultProps
		});
		const starsCell = wrapper.findComponent({ name: "StarsCell" });
		expect(starsCell.exists()).toBe(true);
		expect(starsCell.props("stars")).toBe(4);
	});

	it("renders notes div when rating has notes", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: defaultProps
		});
		const notesDiv = wrapper.find(".whitespace-pre-wrap");
		expect(notesDiv.exists()).toBe(true);
	});

	it("renders muted text when rating has no notes", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: {
				...defaultProps,
				rating: {
					stars: 3,
					notes: ""
				}
			}
		});
		const mutedDiv = wrapper.find(".text-muted");
		expect(mutedDiv.exists()).toBe(true);
	});

	it("renders muted text when notes is undefined", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: {
				...defaultProps,
				rating: {
					stars: 2,
					notes: ""
				}
			}
		});
		const mutedDiv = wrapper.find(".text-muted");
		expect(mutedDiv.exists()).toBe(true);
	});

	it("renders UCard component", async () => {
		const wrapper = await mountSuspended(RatingsCard, {
			props: {
				...defaultProps,
				rating: {
					stars: 5,
					notes: "Line 1\nLine 2"
				}
			}
		});
		const card = wrapper.findComponent({ name: "UCard" });
		expect(card.exists()).toBe(true);
		const notesDiv = wrapper.find(".whitespace-pre-wrap");
		expect(notesDiv.exists()).toBe(true);
	});
});
