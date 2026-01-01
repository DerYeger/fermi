import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import UnarchiveFermentButton from "~/components/UnarchiveFermentButton.vue";

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
			endDate: null
		})),
		getISODatetime: () => "2024-01-15T12:00:00Z",
		useToast: () => ({
			add: vi.fn()
		})
	};
});

describe("components/UnarchiveFermentButton", () => {
	const completedFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Completed Ferment",
		state: "completed" as const,
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
		overall: { stars: 4, notes: "" },
		flavor: { stars: 4, notes: "" },
		texture: { stars: 4, notes: "" },
		smell: { stars: 4, notes: "" },
		process: { stars: 4, notes: "" }
	};

	it("renders restore button with unarchive icon", async () => {
		const wrapper = await mountSuspended(UnarchiveFermentButton, {
			props: { ferment: completedFerment }
		});
		expect(wrapper.find("button").exists()).toBe(true);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:unarchive-03");
	});

	it("shows Restore label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(UnarchiveFermentButton, {
			props: { ferment: completedFerment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Restore");

		const hiddenWrapper = await mountSuspended(UnarchiveFermentButton, {
			props: { ferment: completedFerment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("uses ghost variant with warning color", async () => {
		const wrapper = await mountSuspended(UnarchiveFermentButton, {
			props: { ferment: completedFerment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
	});
});
