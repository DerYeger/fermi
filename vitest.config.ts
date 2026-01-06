import { fileURLToPath } from "node:url";
import { defineVitestProject } from "@nuxt/test-utils/config";
import { defineTestConfig } from "@yeger/vitest-utils";
import { defineConfig } from "vitest/config";

const baseConfig = defineTestConfig({ coverage: false, idempotent: true });

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
					...baseConfig,
					name: "unit",
					include: ["test/unit/**/*.{test,spec}.ts"],
					environment: "node"
				}
			},
			await defineVitestProject({
				test: {
					...baseConfig,
					name: "nuxt",
					include: ["test/nuxt/**/*.{test,spec}.ts"],
					environment: "nuxt",
					globalSetup: [fileURLToPath(new URL("./test/nuxt/globalSetup.ts", import.meta.url))],
					setupFiles: [fileURLToPath(new URL("./test/nuxt/setup.ts", import.meta.url))]
				}
			})
		]
	}
});
