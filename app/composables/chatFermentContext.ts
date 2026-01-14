import type { Ferment } from "~/types/ferment";

export const useChatFermentContext = createGlobalState(() => {
	const selectedFerment = ref<Ferment | null>(null);

	function selectFerment(ferment: Ferment) {
		selectedFerment.value = ferment;
	}

	function clearSelection() {
		selectedFerment.value = null;
	}

	function getSelectionContext(): Omit<Ferment, "images" | "notes" | "reason" | "overall" | "flavor" | "texture" | "smell" | "process"> | null {
		if (!selectedFerment.value) return null;
		const { images, notes, ...rest } = selectedFerment.value;
		if (rest.state === "active") {
			return rest;
		} else if (rest.state === "failed") {
			const { reason, ...failedRest } = rest;
			return failedRest;
		}
		const { overall, flavor, texture, smell, process, ...completedRest } = rest;
		return completedRest;
	}

	const hasSelection = computed(() => selectedFerment.value !== null);

	return {
		selectedFerment: readonly(selectedFerment),
		selectFerment,
		clearSelection,
		getSelectionContext,
		hasSelection
	};
});
