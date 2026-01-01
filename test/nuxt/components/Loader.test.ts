import { Loader } from "#components";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";

describe("components/Loader", () => {
	it("renders UIcon component with loading icon and spin animation", async () => {
		const wrapper = await mountSuspended(Loader);
		const icon = wrapper.findComponent({ name: "UIcon" });
		expect(icon.exists()).toBe(true);
		expect(icon.props("name")).toBe("hugeicons:loading-02");
		expect(wrapper.find("[class*='animate-spin']").exists()).toBe(true);
	});
});
