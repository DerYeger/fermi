import { CardHeader } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

describe("components/CardHeader", () => {
	it("renders with title prop and optional icon", async () => {
		const wrapper = await mountSuspended(CardHeader, {
			props: { title: "Test Title" }
		});
		expect(wrapper.props("title")).toBe("Test Title");

		const wrapperNoIcon = await mountSuspended(CardHeader, {
			props: { title: "No Icon" }
		});
		expect(wrapperNoIcon.findComponent({ name: "UIcon" }).exists()).toBe(false);

		const wrapperWithIcon = await mountSuspended(CardHeader, {
			props: { title: "Test", icon: "i-lucide-star" }
		});
		const icon = wrapperWithIcon.findComponent({ name: "UIcon" });
		expect(icon.exists()).toBe(true);
		expect(icon.props("name")).toBe("i-lucide-star");
	});

	it("renders slot content", async () => {
		const wrapper = await mountSuspended(CardHeader, {
			props: { title: "With Slot" },
			slots: {
				default: "<span data-testid=\"slot-content\">Slot Content</span>"
			}
		});
		expect(wrapper.find("[data-testid='slot-content']").exists()).toBe(true);
	});
});
