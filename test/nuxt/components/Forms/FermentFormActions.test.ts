import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import FermentFormActions from "~/components/Forms/FermentFormActions.vue";

describe("components/Forms/FermentFormActions", () => {
	const defaultProps = {
		submitLabel: "Create"
	};

	it("renders Cancel button with ghost variant and neutral color", async () => {
		const wrapper = await mountSuspended(FermentFormActions, {
			props: defaultProps
		});
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const cancelButton = buttons.find((btn) => btn.props("variant") === "ghost");
		expect(cancelButton).toBeDefined();
		expect(cancelButton?.props("color")).toBe("neutral");
	});

	it("renders submit button with subtle variant", async () => {
		const wrapper = await mountSuspended(FermentFormActions, {
			props: { submitLabel: "Save Changes" }
		});
		const buttons = wrapper.findAllComponents({ name: "UButton" });
		const submitButton = buttons.find((btn) => btn.props("variant") === "subtle");
		expect(submitButton).toBeDefined();
	});

	it("emits cancel event when cancel button is clicked", async () => {
		const wrapper = await mountSuspended(FermentFormActions, {
			props: defaultProps
		});
		const buttons = wrapper.findAll("button");
		const cancelButton = buttons.find((btn) => btn.text().includes("Cancel"));
		await cancelButton?.trigger("click");
		expect(wrapper.emitted("cancel")).toBeTruthy();
	});

	it("has submit button with type submit", async () => {
		const wrapper = await mountSuspended(FermentFormActions, {
			props: defaultProps
		});

		const submitButton = wrapper.find("button[type='submit']");
		expect(submitButton.exists()).toBe(true);
	});
});
