import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FermentActionsCell from "~/components/Table/FermentActionsCell.vue";
import { BASE_COMPLETED_FERMENT, BASE_FAILED_FERMENT } from "../../../data";

describe("components/Table/FermentActionsCell", () => {
	it("renders FavoriteFermentButton component", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_COMPLETED_FERMENT }
		});
		const favoriteBtn = wrapper.findComponent({ name: "FavoriteFermentButton" });
		expect(favoriteBtn.exists()).toBe(true);
		expect(favoriteBtn.props("ferment")).toBe(BASE_COMPLETED_FERMENT);
	});

	it("renders EditFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_COMPLETED_FERMENT }
		});
		const editBtn = wrapper.findComponent({ name: "EditFermentButton" });
		expect(editBtn.exists()).toBe(true);
		expect(editBtn.props("hideLabel")).toBeDefined();
	});

	it("renders DuplicateFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_COMPLETED_FERMENT }
		});
		const dupBtn = wrapper.findComponent({ name: "DuplicateFermentButton" });
		expect(dupBtn.exists()).toBe(true);
		expect(dupBtn.props("hideLabel")).toBeDefined();
	});

	it("renders DeleteFermentButton with hideLabel prop", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_COMPLETED_FERMENT }
		});
		const deleteBtn = wrapper.findComponent({ name: "DeleteFermentButton" });
		expect(deleteBtn.exists()).toBe(true);
		expect(deleteBtn.props("hideLabel")).toBeDefined();
	});

	it("renders UnarchiveFermentButton for completed ferment", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_COMPLETED_FERMENT }
		});
		const unarchiveBtn = wrapper.findComponent({ name: "UnarchiveFermentButton" });
		expect(unarchiveBtn.exists()).toBe(true);
		const unfailBtn = wrapper.findComponent({ name: "UnfailFermentButton" });
		expect(unfailBtn.exists()).toBe(false);
	});

	it("renders UnfailFermentButton for failed ferment", async () => {
		const wrapper = await mountSuspended(FermentActionsCell, {
			shallow: true,
			props: { ferment: BASE_FAILED_FERMENT }
		});
		const unfailBtn = wrapper.findComponent({ name: "UnfailFermentButton" });
		expect(unfailBtn.exists()).toBe(true);
		const unarchiveBtn = wrapper.findComponent({ name: "UnarchiveFermentButton" });
		expect(unarchiveBtn.exists()).toBe(false);
	});
});
