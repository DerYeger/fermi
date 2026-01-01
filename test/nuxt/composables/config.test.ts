import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { describe, expect, it } from "vitest";
import { ref } from "vue";

// Mock useLocalStorage
const mockStorageValue = { dataDir: undefined as string | undefined, maxBackups: 3 };

mockNuxtImport("useLocalStorage", () => {
	return (_key: string, _defaultValue: unknown) => ref(mockStorageValue);
});

describe("composables/config", () => {
	describe("useFermiConfig", () => {
		it("should return config with default values", async () => {
			const { useFermiConfig } = await import("~/composables/config");
			const config = useFermiConfig();
			expect(config.maxBackups.value).toBe(3);
			expect(config.dataDir.value).toBeUndefined();
		});
	});
});
