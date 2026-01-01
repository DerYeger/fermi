import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		coverage: {
			provider: "v8",
			include: ["app/**/*.{ts,vue}"],
			exclude: ["app/modules/**", "app/pages/**", "app/layouts/**", "app/app.vue", "app/app-base.vue", "app/error.vue", "app/queryClient.ts", "app/router.options.ts", "app/app.config.ts"]
		},
		projects: [
			{
				resolve: {
					alias: {
						"~": fileURLToPath(new URL("./app", import.meta.url))
					}
				},
				test: {
					name: "unit",
					include: ["test/unit/**/*.{test,spec}.ts"],
					environment: "node",
					mockReset: true,
					clearMocks: true,
					restoreMocks: true
				}
			},
			await defineVitestProject({
				test: {
					name: "nuxt",
					include: ["test/nuxt/**/*.{test,spec}.ts"],
					environment: "nuxt",
					mockReset: true,
					clearMocks: true,
					restoreMocks: true,
					globalSetup: [fileURLToPath(new URL("./test/nuxt/globalSetup.ts", import.meta.url))],
					setupFiles: [fileURLToPath(new URL("./test/nuxt/setup.ts", import.meta.url))]
				}
			})
		]
	}
});
