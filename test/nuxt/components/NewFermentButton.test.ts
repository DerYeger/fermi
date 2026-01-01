import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import { defineComponent, h } from "vue";
import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

// Mock NewFermentForm component
vi.mock("~/components/Forms/NewFermentForm/NewFermentForm.vue", () => ({
	default: {
		name: "NewFermentForm",
		emits: ["submit", "cancel"],
		template: "<div>New Ferment Form</div>"
	}
}));

// Stub UTooltip to avoid TooltipProvider requirement
const UTooltipStub = defineComponent({
	name: "UTooltip",
	setup(_, { slots }) {
		return () => h("div", { class: "tooltip-stub" }, slots.default?.());
	}
});

// Mock FermentCollection and related functions
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			insert: vi.fn()
		},
		useToast: () => ({
			add: vi.fn()
		}),
		defineShortcuts: vi.fn()
	};
});

vi.mock("~/types/utils", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		sortImages: (images: unknown[]) => images,
		getErrorMessage: (error: unknown) => String(error)
	};
});

describe("components/Forms/NewFermentForm/NewFermentButton", () => {
	const mountOptions = {
		global: {
			stubs: {
				UTooltip: UTooltipStub
			}
		}
	};

	it("renders new ferment button with correct props", async () => {
		const wrapper = await mountSuspended(NewFermentButton, mountOptions);
		expect(wrapper.find("button").exists()).toBe(true);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:plus-sign");
		expect(button.props("label")).toBe("New ferment");
		expect(button.props("variant")).toBe("subtle");
	});

	it("renders UModal for new ferment form", async () => {
		const wrapper = await mountSuspended(NewFermentButton, mountOptions);
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Create new ferment");
	});
});
