import { vi } from "vitest";
import { defineComponent, h } from "vue";

/** Stub UModal to render body slot for testing modal content */
export const UModalStub = defineComponent({
	name: "UModal",
	props: ["open", "title", "description"],
	setup(_, { slots }) {
		return () => h("div", slots.body?.());
	}
});

/** Stub UTooltip to render default slot for testing tooltip trigger */
export const UTooltipStub = defineComponent({
	name: "UTooltip",
	props: ["kbds", "content"],
	setup(_, { slots }) {
		return () => h("div", slots.default?.());
	}
});

/** Stub FermentFormActions to render submit button for form testing */
export const FermentFormActionsStub = defineComponent({
	name: "FermentFormActions",
	props: ["submitLabel"],
	emits: ["cancel"],
	setup(props) {
		return () => h("div", [
			h("button", { type: "submit" }, props.submitLabel)
		]);
	}
});

/** Mock for UFileUpload inputRef.click - reset this in tests that need to check it */
export const fileUploadClickMock = vi.fn();

/** Stub UFileUpload to properly handle model-value updates */
export const UFileUploadStub = defineComponent({
	name: "UFileUpload",
	props: ["accept", "disabled", "multiple"],
	emits: ["update:model-value"],
	setup(props, { expose }) {
		const inputRef = { click: fileUploadClickMock };
		expose({ inputRef });
		return () => h("input", {
			type: "file",
			accept: props.accept,
			disabled: props.disabled,
			multiple: props.multiple
		});
	}
});

/** Stub UInputMenu to properly handle search-term and model-value updates */
export const UInputMenuStub = defineComponent({
	name: "UInputMenu",
	props: ["modelValue", "items", "placeholder", "searchTerm", "creatable", "autofocus", "open", "createItem"],
	emits: ["update:model-value", "update:search-term", "update:open", "create", "blur"],
	setup(_, { slots }) {
		return () => h("div", slots.default?.());
	}
});

/** Stub UInputNumber to properly handle model-value updates */
export const UInputNumberStub = defineComponent({
	name: "UInputNumber",
	props: ["modelValue", "min", "max", "step", "placeholder", "increment", "decrement"],
	emits: ["update:model-value"],
	setup() {
		return () => h("input", { type: "number" });
	}
});
