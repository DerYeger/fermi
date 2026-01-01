import { describe, expect, it } from "vitest";
import { FERMI_CONFIG_DEFAULTS, FermiConfigSchema } from "~/types/config";

describe("types/config", () => {
	describe("fermiConfigSchema", () => {
		it("should validate config with defaults and custom dataDir", () => {
			const config = { maxBackups: 3 };
			const result = FermiConfigSchema.safeParse(config);
			expect(result.success).toBe(true);

			const configWithDataDir = { dataDir: "/custom/path", maxBackups: 5 };
			const resultWithDataDir = FermiConfigSchema.safeParse(configWithDataDir);
			expect(resultWithDataDir.success).toBe(true);
		});

		it("should reject maxBackups outside 1-20 range", () => {
			const configTooLow = { maxBackups: 0 };
			const resultTooLow = FermiConfigSchema.safeParse(configTooLow);
			expect(resultTooLow.success).toBe(false);

			const configTooHigh = { maxBackups: 21 };
			const resultTooHigh = FermiConfigSchema.safeParse(configTooHigh);
			expect(resultTooHigh.success).toBe(false);
		});

		it("should apply default maxBackups when not provided", () => {
			const config = {};
			const result = FermiConfigSchema.parse(config);
			expect(result.maxBackups).toBe(3);
		});
	});

	describe("fERMI_CONFIG_DEFAULTS", () => {
		it("should have correct default values", () => {
			expect(FERMI_CONFIG_DEFAULTS.dataDir).toBeUndefined();
			expect(FERMI_CONFIG_DEFAULTS.maxBackups).toBe(3);
		});
	});
});
