import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import Empty from "~/components/Empty.vue";

// Mock NewFermentButton component
vi.mock("~/components/Forms/NewFermentForm/NewFermentButton.vue", () => ({
	default: {
		name: "NewFermentButton",
		template: "<button>New Ferment</button>"
	}
}));

// Mock navigateTo
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		navigateTo: vi.fn()
	};
});

describe("components/Empty", () => {
	describe("with type='active'", () => {
		it("renders UEmpty with correct title and description for active type", async () => {
			const wrapper = await mountSuspended(Empty, {
				props: { type: "active" }
			});
			const uEmpty = wrapper.findComponent({ name: "UEmpty" });
			expect(uEmpty.exists()).toBe(true);
			expect(uEmpty.props("title")).toBe("No active ferments");
			expect(uEmpty.props("description")).toBe("Active ferments will appear here.");
		});
	});

	describe("with type='archived'", () => {
		it("renders UEmpty with correct title and description for archived type", async () => {
			const wrapper = await mountSuspended(Empty, {
				props: { type: "archived" }
			});
			const uEmpty = wrapper.findComponent({ name: "UEmpty" });
			expect(uEmpty.props("title")).toBe("No archived ferments");
			expect(uEmpty.props("description")).toBe("Archived ferments will appear here.");
		});

		it("renders UButton with correct props for archived type", async () => {
			const wrapper = await mountSuspended(Empty, {
				props: { type: "archived" }
			});
			const button = wrapper.findComponent({ name: "UButton" });
			expect(button.exists()).toBe(true);
			expect(button.props("label")).toBe("See active ferments");
			expect(button.props("variant")).toBe("subtle");
		});
	});

	describe("with type='all'", () => {
		it("renders UEmpty with correct title and description for all type", async () => {
			const wrapper = await mountSuspended(Empty, {
				props: { type: "all" }
			});
			const uEmpty = wrapper.findComponent({ name: "UEmpty" });
			expect(uEmpty.props("title")).toBe("No ferments");
			expect(uEmpty.props("description")).toBe("Create your first ferment to get started.");
		});
	});

	it("renders NewFermentButton and UEmpty with naked variant", async () => {
		const wrapper = await mountSuspended(Empty, {
			props: { type: "active" }
		});
		expect(wrapper.findComponent({ name: "NewFermentButton" }).exists()).toBe(true);
		const uEmpty = wrapper.findComponent({ name: "UEmpty" });
		expect(uEmpty.props("variant")).toBe("naked");
	});
});
