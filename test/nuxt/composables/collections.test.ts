import { mockNuxtImport } from "@nuxt/test-utils/runtime";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ref } from "vue";

// Mock config values
const mockDataDir = ref<string | undefined>(undefined);
const mockMaxBackups = ref(3);
const mockPathSep = ref("/");
const mockDocumentDir = ref("/Users/test/Documents");

// Mock state for Tauri functions - using object to avoid hoisting issues
const mockState = {
	mkdir: vi.fn(),
	readDir: vi.fn(),
	readTextFile: vi.fn(),
	writeTextFile: vi.fn(),
	remove: vi.fn(),
	exists: vi.fn(),
	toastAdd: vi.fn()
};

mockNuxtImport("useFermiConfig", () => {
	return () => ({
		dataDir: mockDataDir,
		maxBackups: mockMaxBackups
	});
});

mockNuxtImport("useTauriFsMkdir", () => (...args: unknown[]) => mockState.mkdir(...args));
mockNuxtImport("useTauriFsReadDir", () => (...args: unknown[]) => mockState.readDir(...args));
mockNuxtImport("useTauriFsReadTextFile", () => (...args: unknown[]) => mockState.readTextFile(...args));
mockNuxtImport("useTauriFsWriteTextFile", () => (...args: unknown[]) => mockState.writeTextFile(...args));
mockNuxtImport("useTauriFsRemove", () => (...args: unknown[]) => mockState.remove(...args));
mockNuxtImport("useTauriFsExists", () => (...args: unknown[]) => mockState.exists(...args));
mockNuxtImport("useTauriPathDocumentDir", () => async () => mockDocumentDir.value);
mockNuxtImport("useTauriPathSep", () => () => mockPathSep.value);
mockNuxtImport("useToast", () => () => ({ add: mockState.toastAdd }));

// Mock queryClient
vi.mock("~/queryClient", () => ({
	queryClient: {
		invalidateQueries: vi.fn()
	},
	queryKeys: {
		ferments: {
			all: ["ferments"]
		}
	}
}));

// Mock @tanstack/vue-db
vi.mock("@tanstack/vue-db", () => ({
	createCollection: vi.fn(() => ({}))
}));

// Mock @tanstack/query-db-collection to capture options
vi.mock("@tanstack/query-db-collection", () => ({
	queryCollectionOptions: vi.fn((options: Record<string, unknown>) => {
		// Assign to global for access in tests
		(globalThis as Record<string, unknown>).__testCapturedOptions = options;
		return options;
	})
}));

// Mock FermentSchema
vi.mock("~/types/ferment", () => ({
	FermentSchema: {
		parse: vi.fn((data) => data)
	}
}));

// Mock getErrorMessage
vi.mock("~/types/utils", () => ({
	getErrorMessage: vi.fn((error) => error?.message || "Unknown error")
}));

// Mock Tauri path API
vi.mock("@tauri-apps/api/path", () => ({
	documentDir: vi.fn(async () => mockDocumentDir.value),
	sep: vi.fn(() => mockPathSep.value)
}));

// Mock Tauri plugin-fs - this is what the useTauri* composables wrap
vi.mock("@tauri-apps/plugin-fs", () => ({
	mkdir: (...args: unknown[]) => mockState.mkdir(...args),
	readDir: (...args: unknown[]) => mockState.readDir(...args),
	readTextFile: (...args: unknown[]) => mockState.readTextFile(...args),
	writeTextFile: (...args: unknown[]) => mockState.writeTextFile(...args),
	remove: (...args: unknown[]) => mockState.remove(...args),
	exists: (...args: unknown[]) => mockState.exists(...args)
}));

describe("composables/collections", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockDataDir.value = undefined;
		mockMaxBackups.value = 3;
		mockPathSep.value = "/";
		mockDocumentDir.value = "/Users/test/Documents";
		mockState.readDir.mockResolvedValue([]);
		mockState.mkdir.mockResolvedValue(undefined);
		mockState.exists.mockResolvedValue(false);
		mockState.writeTextFile.mockResolvedValue(undefined);
		mockState.remove.mockResolvedValue(undefined);
	});

	// Helper to get captured options after import
	const getCapturedOptions = () => (globalThis as Record<string, unknown>).__testCapturedOptions as Record<string, unknown> | null;

	describe("getDataDir", () => {
		it("should return custom dataDir when configured", async () => {
			mockDataDir.value = "/custom/data/path";

			const { getDataDir } = await import("~/composables/collections");
			const result = await getDataDir();

			expect(result).toBe("/custom/data/path");
		});

		it("should return default path when dataDir is not configured", async () => {
			mockDataDir.value = undefined;
			mockDocumentDir.value = "/Users/test/Documents";
			mockPathSep.value = "/";

			const { getDataDir } = await import("~/composables/collections");
			const result = await getDataDir();

			expect(result).toBe("/Users/test/Documents/dev.janmueller.fermi");
		});

		it("should use correct path separator for the platform", async () => {
			mockDataDir.value = undefined;
			mockDocumentDir.value = "C:\\Users\\test\\Documents";
			mockPathSep.value = "\\";

			const { getDataDir } = await import("~/composables/collections");
			const result = await getDataDir();

			expect(result).toBe("C:\\Users\\test\\Documents\\dev.janmueller.fermi");
		});
	});

	describe("fermentCollection", () => {
		it("should be exported", async () => {
			const { FermentCollection } = await import("~/composables/collections");
			expect(FermentCollection).toBeDefined();
		});

		it("should configure queryCollectionOptions with correct queryKey", async () => {
			await import("~/composables/collections");
			const options = getCapturedOptions();
			expect(options).not.toBeNull();
			expect(options?.queryKey).toEqual(["ferments"]);
		});

		it("should have getKey function that returns item id", async () => {
			await import("~/composables/collections");
			const options = getCapturedOptions();
			expect(options).not.toBeNull();
			const getKey = options?.getKey as (item: { id: string }) => string;
			expect(getKey({ id: "test-id" })).toBe("test-id");
		});
	});

	describe("queryFn (loadAllFerments)", () => {
		it("should create data directory if it does not exist", async () => {
			mockDataDir.value = "/test/data";
			mockState.readDir.mockResolvedValue([]);

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const queryFn = options?.queryFn as () => Promise<unknown[]>;
			await queryFn();

			expect(mockState.mkdir).toHaveBeenCalledWith("/test/data", { recursive: true });
		});

		it("should load ferments from directories with correct prefix", async () => {
			mockDataDir.value = "/test/data";
			mockState.readDir.mockResolvedValue([
				{ name: "fermi_abc123", isDirectory: true },
				{ name: "fermi_def456", isDirectory: true },
				{ name: "other_folder", isDirectory: true },
				{ name: "somefile.txt", isDirectory: false }
			]);

			const mockFerment1 = { id: "abc123", name: "Ferment 1" };
			const mockFerment2 = { id: "def456", name: "Ferment 2" };

			mockState.readTextFile
				.mockResolvedValueOnce(JSON.stringify(mockFerment1))
				.mockResolvedValueOnce(JSON.stringify(mockFerment2));

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const queryFn = options?.queryFn as () => Promise<unknown[]>;
			const result = await queryFn();

			expect(result).toHaveLength(2);
			expect(mockState.readTextFile).toHaveBeenCalledTimes(2);
		});

		it("should handle failed ferment loads and show toast notification", async () => {
			mockDataDir.value = "/test/data";
			mockState.readDir.mockResolvedValue([
				{ name: "fermi_valid", isDirectory: true },
				{ name: "fermi_invalid", isDirectory: true }
			]);

			mockState.readTextFile
				.mockResolvedValueOnce(JSON.stringify({ id: "valid", name: "Valid" }))
				.mockRejectedValueOnce(new Error("Invalid JSON"));

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const queryFn = options?.queryFn as () => Promise<unknown[]>;
			const result = await queryFn();

			expect(result).toHaveLength(1);
			expect(mockState.toastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "warning",
					title: "Some ferments failed to load"
				})
			);
		});

		it("should return empty array when no ferment directories exist", async () => {
			mockDataDir.value = "/test/data";
			mockState.readDir.mockResolvedValue([]);

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const queryFn = options?.queryFn as () => Promise<unknown[]>;
			const result = await queryFn();

			expect(result).toEqual([]);
		});
	});

	describe("onInsert callback", () => {
		it("should write ferment data on insert", async () => {
			mockDataDir.value = "/test/data";
			mockState.exists.mockResolvedValue(false);

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onInsert = options?.onInsert as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onInsert({
				transaction: {
					mutations: [{ modified: { id: "new-ferment" } }]
				}
			});

			expect(mockState.mkdir).toHaveBeenCalled();
			expect(mockState.writeTextFile).toHaveBeenCalled();
		});

		it("should show error toast when insert fails", async () => {
			mockDataDir.value = "/test/data";
			mockState.mkdir.mockRejectedValue(new Error("Write failed"));

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onInsert = options?.onInsert as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onInsert({
				transaction: {
					mutations: [{ modified: { id: "new-ferment" } }]
				}
			});

			expect(mockState.toastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					title: "Failed to save"
				})
			);
		});
	});

	describe("onUpdate callback", () => {
		it("should write ferment data on update", async () => {
			mockDataDir.value = "/test/data";
			mockState.exists.mockResolvedValue(false);

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onUpdate = options?.onUpdate as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onUpdate({
				transaction: {
					mutations: [{ modified: { id: "updated-ferment" } }]
				}
			});

			expect(mockState.writeTextFile).toHaveBeenCalled();
		});

		it("should show error toast when update fails", async () => {
			mockDataDir.value = "/test/data";
			mockState.mkdir.mockRejectedValue(new Error("Update failed"));

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onUpdate = options?.onUpdate as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onUpdate({
				transaction: {
					mutations: [{ modified: { id: "updated-ferment" } }]
				}
			});

			expect(mockState.toastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					title: "Failed to update"
				})
			);
		});
	});

	describe("onDelete callback", () => {
		it("should remove ferment directory on delete", async () => {
			mockDataDir.value = "/test/data";

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onDelete = options?.onDelete as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onDelete({
				transaction: {
					mutations: [{ modified: { id: "deleted-ferment" } }]
				}
			});

			expect(mockState.remove).toHaveBeenCalledWith(
				expect.stringContaining("fermi_deleted-ferment"),
				{ recursive: true }
			);
		});

		it("should show error toast when delete fails", async () => {
			mockDataDir.value = "/test/data";
			mockState.remove.mockRejectedValue(new Error("Delete failed"));

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onDelete = options?.onDelete as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onDelete({
				transaction: {
					mutations: [{ modified: { id: "deleted-ferment" } }]
				}
			});

			expect(mockState.toastAdd).toHaveBeenCalledWith(
				expect.objectContaining({
					color: "error",
					title: "Failed to delete"
				})
			);
		});
	});

	describe("backup functionality", () => {
		it("should create backup before writing when file exists", async () => {
			mockDataDir.value = "/test/data";
			mockState.exists.mockResolvedValue(true);
			mockState.readTextFile.mockResolvedValue("{\"id\":\"test\"}");

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onUpdate = options?.onUpdate as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onUpdate({
				transaction: {
					mutations: [{ modified: { id: "test-ferment" } }]
				}
			});

			// Should write backup file
			expect(mockState.writeTextFile).toHaveBeenCalledWith(
				expect.stringContaining("backup_1.json"),
				expect.any(String)
			);
		});

		it("should skip backup when file does not exist", async () => {
			mockDataDir.value = "/test/data";
			mockState.exists.mockResolvedValue(false);

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onInsert = options?.onInsert as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onInsert({
				transaction: {
					mutations: [{ modified: { id: "new-ferment" } }]
				}
			});

			// Should only write the main data file, not backup
			expect(mockState.writeTextFile).toHaveBeenCalledTimes(1);
			expect(mockState.writeTextFile).toHaveBeenCalledWith(
				expect.stringContaining("data.json"),
				expect.any(String)
			);
		});

		it("should rotate backups based on maxBackups setting", async () => {
			mockDataDir.value = "/test/data";
			mockMaxBackups.value = 2;
			mockState.exists
				.mockResolvedValueOnce(true) // data.json exists
				.mockResolvedValueOnce(true); // backup_1.json exists
			mockState.readTextFile
				.mockResolvedValueOnce("{\"id\":\"current\"}")
				.mockResolvedValueOnce("{\"id\":\"backup1\"}");

			await import("~/composables/collections");
			const options = getCapturedOptions();
			const onUpdate = options?.onUpdate as (args: { transaction: { mutations: Array<{ modified: { id: string } }> } }) => Promise<void>;

			await onUpdate({
				transaction: {
					mutations: [{ modified: { id: "test" } }]
				}
			});

			// Should have rotated backup_1 to backup_2 and created new backup_1
			expect(mockState.writeTextFile).toHaveBeenCalledWith(
				expect.stringContaining("backup_2.json"),
				expect.any(String)
			);
		});
	});
});
