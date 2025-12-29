import { QueryClient } from "@tanstack/vue-query";
import { defineKeyHierarchy } from "key-hierarchy";

export const queryClient = new QueryClient();

export const queryKeys = defineKeyHierarchy({
	ferments: {
		all: true
	}
});
