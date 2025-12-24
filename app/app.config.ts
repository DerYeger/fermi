export default defineAppConfig({
	app: {
		name: "Fermi",
		description: "Fermentation Tracking App"
	},
	ui: {
		colors: {
			primary: "amber",
			neutral: "zinc"
		},
		button: {
			slots: {
				base: "cursor-pointer"
			}
		},
		formField: {
			slots: {
				root: "w-full"
			}
		},
		input: {
			slots: {
				root: "w-full"
			}
		},
		textarea: {
			slots: {
				root: "w-full",
				base: "resize-none"
			}
		},
		card: {
			slots: {
				root: "bg-(--ui-bg-elevated)"
			}
		}
	}
});
