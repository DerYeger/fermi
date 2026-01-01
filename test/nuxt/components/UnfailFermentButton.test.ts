import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import UnfailFermentButton from "~/components/UnfailFermentButton.vue";

// Mock FermentCollection and related functions
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			update: vi.fn()
		},
		transitionToActive: vi.fn((ferment) => ({
			...ferment,
			state: "active",
			endDate: null,
			reason: undefined
		})),
		getISODatetime: () => "2024-01-15T12:00:00Z",
		useToast: () => ({
			add: vi.fn()
		})
	};
});

describe("components/UnfailFermentButton", () => {
	const failedFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Failed Ferment",
		state: "failed" as const,
		startDate: "2024-01-01",
		endDate: "2024-01-15",
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z",
		reason: "Mold appeared"
	};

	it("renders restore button with restore icon", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: failedFerment }
		});
		expect(wrapper.find("button").exists()).toBe(true);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:waste-restore");
	});

	it("shows Restore label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: failedFerment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Restore");

		const hiddenWrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: failedFerment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("uses ghost variant with warning color", async () => {
		const wrapper = await mountSuspended(UnfailFermentButton, {
			props: { ferment: failedFerment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
	});
});
