import type { Ferment } from "~/types/ferment";
import { describe, expect, it } from "vitest";
import { BASE_ACTIVE_FERMENT, BASE_COMPLETED_FERMENT } from "../../data";

describe("composables/chatFermentContext", () => {
	describe("useChatFermentContext", () => {
		it("should start with no selection", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();
			// Clear any previous state
			context.clearSelection();

			expect(context.selectedFermentId.value).toBeNull();
			expect(context.selectedFerment.value).toBeNull();
			expect(context.hasSelection.value).toBe(false);
		});

		it("should select a ferment", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();
			context.clearSelection();

			context.selectFerment(BASE_ACTIVE_FERMENT);

			expect(context.selectedFermentId.value).toBe(BASE_ACTIVE_FERMENT.id);
			expect(context.selectedFerment.value).toEqual(BASE_ACTIVE_FERMENT);
			expect(context.hasSelection.value).toBe(true);
		});

		it("should clear selection", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			context.selectFerment(BASE_ACTIVE_FERMENT);
			context.clearSelection();

			expect(context.selectedFermentId.value).toBeNull();
			expect(context.selectedFerment.value).toBeNull();
			expect(context.hasSelection.value).toBe(false);
		});

		it("should get selection context without clearing it", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			context.selectFerment(BASE_ACTIVE_FERMENT);
			const consumed = context.getSelectionContext();

			expect(consumed).not.toBeNull();
			expect(consumed?.id).toBe(BASE_ACTIVE_FERMENT.id);
			expect(consumed?.name).toBe(BASE_ACTIVE_FERMENT.name);
			expect(context.selectedFerment.value).toEqual(BASE_ACTIVE_FERMENT);
			expect(context.hasSelection.value).toBe(true);
		});

		it("should return null when getting empty selection context", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();
			context.clearSelection();

			const consumed = context.getSelectionContext();

			expect(consumed).toBeNull();
		});

		it("should prepare ferment context with trimmed data", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			const fermentWithLongNotes: Ferment = {
				...BASE_ACTIVE_FERMENT,
				notes: "A".repeat(600)
			};

			context.selectFerment(fermentWithLongNotes);
			const consumed = context.getSelectionContext();

			expect(consumed?.notes.length).toBeLessThanOrEqual(503); // 500 + "..."
			expect(consumed?.notes.endsWith("...")).toBe(true);
		});

		it("should not trim short notes", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			const fermentWithShortNotes: Ferment = {
				...BASE_ACTIVE_FERMENT,
				notes: "Short notes"
			};

			context.selectFerment(fermentWithShortNotes);
			const consumed = context.getSelectionContext();

			expect(consumed?.notes).toBe("Short notes");
		});

		it("should include only necessary ingredient fields", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			const fermentWithIngredients: Ferment = {
				...BASE_ACTIVE_FERMENT,
				ingredients: [
					{ id: "ing-1", name: "Cabbage", quantity: 500, unit: "g" },
					{ id: "ing-2", name: "Salt", quantity: 10, unit: "g" }
				]
			};

			context.selectFerment(fermentWithIngredients);
			const consumed = context.getSelectionContext();

			expect(consumed?.ingredients).toHaveLength(2);
			expect(consumed?.ingredients[0]).toEqual({ name: "Cabbage", quantity: 500, unit: "g" });
			expect(consumed?.ingredients[0]).not.toHaveProperty("id");
		});

		it("should handle completed ferment state", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();

			context.selectFerment(BASE_COMPLETED_FERMENT);
			const consumed = context.getSelectionContext();

			expect(consumed?.state).toBe("completed");
			expect(consumed?.endDate).toBe(BASE_COMPLETED_FERMENT.endDate);
		});

		it("should replace previous selection when selecting new ferment", async () => {
			const { useChatFermentContext } = await import("~/composables/chatFermentContext");
			const context = useChatFermentContext();
			context.clearSelection();

			context.selectFerment(BASE_ACTIVE_FERMENT);
			context.selectFerment(BASE_COMPLETED_FERMENT);

			expect(context.selectedFermentId.value).toBe(BASE_COMPLETED_FERMENT.id);
			expect(context.selectedFerment.value?.name).toBe(BASE_COMPLETED_FERMENT.name);
		});
	});
});
