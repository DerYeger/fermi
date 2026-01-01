import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it, vi } from "vitest";
import ArchiveFermentButton from "~/components/Forms/ArchiveFermentForm/ArchiveFermentButton.vue";

// Mock FermentCollection and related functions
vi.mock("#imports", async (importOriginal) => {
	const actual = await importOriginal<object>();
	return {
		...actual,
		FermentCollection: {
			update: vi.fn()
		},
		getISODatetime: () => "2024-01-15T12:00:00Z",
		useToast: () => ({
			add: vi.fn()
		}),
		useRoute: () => ({
			name: "ferments",
			params: {}
		}),
		useRouter: () => ({
			push: vi.fn()
		})
	};
});

describe("components/ArchiveFermentButton", () => {
	const activeFerment = {
		version: 1 as const,
		id: "test-1",
		name: "Active Ferment",
		state: "active" as const,
		startDate: "2024-01-01",
		endDate: null,
		saltRatio: 0.02,
		container: null,
		ingredients: [],
		images: [],
		isFavorite: false,
		notes: "",
		createdAt: "2024-01-01T00:00:00Z",
		updatedAt: "2024-01-01T00:00:00Z"
	};

	it("renders complete button with archive icon", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: activeFerment }
		});
		expect(wrapper.find("button").exists()).toBe(true);
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("icon")).toBe("hugeicons:archive-03");
	});

	it("shows Complete label when hideLabel is false and hides when true", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: activeFerment, hideLabel: false }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("label")).toBe("Complete");

		const hiddenWrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: activeFerment, hideLabel: true }
		});
		const hiddenButton = hiddenWrapper.findComponent({ name: "UButton" });
		expect(hiddenButton.props("label")).toBeUndefined();
	});

	it("uses ghost variant with warning color", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: activeFerment }
		});
		const button = wrapper.findComponent({ name: "UButton" });
		expect(button.props("variant")).toBe("ghost");
		expect(button.props("color")).toBe("warning");
	});

	it("has a modal for archive form", async () => {
		const wrapper = await mountSuspended(ArchiveFermentButton, {
			props: { ferment: activeFerment }
		});
		const modal = wrapper.findComponent({ name: "UModal" });
		expect(modal.exists()).toBe(true);
		expect(modal.props("title")).toBe("Complete ferment");
	});
});
