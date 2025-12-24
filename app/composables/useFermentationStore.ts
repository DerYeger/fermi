import type { AppConfig, AppSettings, Ferment, FermentationData } from "~/types/ferment";
import { defaultConfig, defaultSettings, generateId } from "~/types/ferment";

const DATA_FILENAME = "fermentation-data.json";
const BACKUP_PREFIX = "fermentation-backup-";
const CONFIG_FILENAME = "config.json";

export const useFermentationStore = () => {
	const ferments = useState<Ferment[]>("ferments", () => []);
	const settings = useState<AppSettings>("settings", () => ({ ...defaultSettings }));
	const config = useState<AppConfig>("config", () => ({ ...defaultConfig }));
	const isLoading = useState<boolean>("isLoading", () => true);
	const configLoaded = useState<boolean>("configLoaded", () => false);

	const activeFerments = computed(() =>
		ferments.value.filter((f) => !f.isArchived).sort((a, b) =>
			new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
		)
	);

	const archivedFerments = computed(() =>
		ferments.value.filter((f) => f.isArchived).sort((a, b) =>
			new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
		)
	);

	// Data is stored in the configured location or AppData
	function getDataFilePath() {
		if (config.value.saveLocation) {
			return `${config.value.saveLocation}/${DATA_FILENAME}`;
		}
		return DATA_FILENAME;
	}

	function getBackupFilePath(index: number) {
		if (config.value.saveLocation) {
			return `${config.value.saveLocation}/${BACKUP_PREFIX}${index}.json`;
		}
		return `${BACKUP_PREFIX}${index}.json`;
	}

	function getBaseDir() {
		return config.value.saveLocation ? undefined : useTauriFsBaseDirectory.AppData;
	}

	// Load config from AppData/.fermi/config.json
	async function loadConfig() {
		try {
			const content = await useTauriFsReadTextFile(CONFIG_FILENAME, { baseDir: useTauriFsBaseDirectory.AppData });
			const loadedConfig: AppConfig = JSON.parse(content);
			config.value = { ...defaultConfig, ...loadedConfig };
			configLoaded.value = true;
		} catch (error) {
			console.error("Failed to load config:", error);
			config.value = { ...defaultConfig };
			configLoaded.value = true;
		}
	}

	// Save config to AppData/.fermi/config.json
	async function saveConfig() {
		try {
			await useTauriFsWriteTextFile(CONFIG_FILENAME, JSON.stringify(config.value, null, 2), { baseDir: useTauriFsBaseDirectory.AppData });
		} catch (error) {
			console.error("Failed to save config:", error);
			throw error;
		}
	}

	// Check if data exists at a given location
	async function checkDataExistsAt(location: string): Promise<boolean> {
		try {
			if (location) {
				const path = `${location}/${DATA_FILENAME}`;
				return await useTauriFsExists(path);
			} else {
				return await useTauriFsExists(DATA_FILENAME, { baseDir: useTauriFsBaseDirectory.AppData });
			}
		} catch {
			return false;
		}
	}

	// Load data from a specific location
	async function loadDataFromLocation(location: string): Promise<FermentationData | null> {
		try {
			let content: string;
			if (location) {
				const path = `${location}/${DATA_FILENAME}`;
				content = await useTauriFsReadTextFile(path);
			} else {
				content = await useTauriFsReadTextFile(DATA_FILENAME, { baseDir: useTauriFsBaseDirectory.AppData });
			}
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	async function createBackup() {
		try {
			const baseDir = getBaseDir();
			const dataPath = getDataFilePath();

			const exists = await useTauriFsExists(dataPath, baseDir ? { baseDir } : undefined);
			if (!exists) return;

			const currentData = await useTauriFsReadTextFile(dataPath, baseDir ? { baseDir } : undefined);

			// Rotate backups (shift all backups up by 1, delete oldest if exceeds max)
			for (let i = settings.value.maxBackups - 1; i >= 1; i--) {
				const oldPath = getBackupFilePath(i);
				const newPath = getBackupFilePath(i + 1);

				const oldExists = await useTauriFsExists(oldPath, baseDir ? { baseDir } : undefined);
				if (oldExists) {
					if (i + 1 > settings.value.maxBackups) {
						await useTauriFsRemove(oldPath, baseDir ? { baseDir } : undefined);
					} else {
						const backupData = await useTauriFsReadTextFile(oldPath, baseDir ? { baseDir } : undefined);
						await useTauriFsWriteTextFile(newPath, backupData, baseDir ? { baseDir } : undefined);
					}
				}
			}

			// Create new backup at position 1
			await useTauriFsWriteTextFile(getBackupFilePath(1), currentData, baseDir ? { baseDir } : undefined);
		} catch (error) {
			console.error("Failed to create backup:", error);
		}
	}

	async function saveData() {
		try {
			await createBackup();

			const data: FermentationData = {
				ferments: ferments.value,
				settings: settings.value
			};

			const baseDir = getBaseDir();
			const dataPath = getDataFilePath();

			if (baseDir) {
				// Ensure AppData directory exists
				const appDataExists = await useTauriFsExists("", { baseDir });
				if (!appDataExists) {
					await useTauriFsMkdir("", { baseDir, recursive: true });
				}
			}

			await useTauriFsWriteTextFile(dataPath, JSON.stringify(data, null, 2), baseDir ? { baseDir } : undefined);
		} catch (error) {
			console.error("Failed to save data:", error);
			throw error;
		}
	}

	async function loadData() {
		isLoading.value = true;
		try {
			// Load config first if not already loaded
			if (!configLoaded.value) {
				await loadConfig();
			}

			const baseDir = getBaseDir();
			const dataPath = getDataFilePath();

			const exists = await useTauriFsExists(dataPath, baseDir ? { baseDir } : undefined);
			if (exists) {
				const content = await useTauriFsReadTextFile(dataPath, baseDir ? { baseDir } : undefined);
				const data: FermentationData = JSON.parse(content);
				ferments.value = data.ferments || [];
				settings.value = { ...defaultSettings, ...data.settings };
			}
		} catch (error) {
			console.error("Failed to load data:", error);
			ferments.value = [];
			settings.value = { ...defaultSettings };
		} finally {
			isLoading.value = false;
		}
	}

	async function addFerment(ferment: Omit<Ferment, "id" | "createdAt" | "updatedAt">) {
		const now = new Date().toISOString();
		const newFerment: Ferment = {
			...ferment,
			id: generateId(),
			createdAt: now,
			updatedAt: now
		};
		ferments.value.push(newFerment);
		await saveData();
		return newFerment;
	}

	async function updateFerment(id: string, updates: Partial<Ferment>) {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			const ferment = ferments.value[index];
			Object.assign(ferment, updates, { updatedAt: new Date().toISOString() });
			await saveData();
		}
	}

	async function deleteFerment(id: string) {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			ferments.value.splice(index, 1);
			await saveData();
		}
	}

	async function archiveFerment(id: string, rating: number, completionNotes: string) {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			const ferment = ferments.value[index];
			Object.assign(ferment, {
				isArchived: true,
				rating,
				completionNotes,
				endDate: new Date().toISOString().split("T")[0],
				updatedAt: new Date().toISOString()
			});
			await saveData();
		}
	}

	async function unarchiveFerment(id: string) {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			const ferment = ferments.value[index];
			Object.assign(ferment, {
				isArchived: false,
				rating: undefined,
				completionNotes: undefined,
				updatedAt: new Date().toISOString()
			});
			await saveData();
		}
	}

	async function updateSettings(newSettings: Partial<AppSettings>) {
		settings.value = { ...settings.value, ...newSettings };
		await saveData();
	}

	// Set save location with option to use existing data at new location
	async function setSaveLocation(location: string, useExistingData: boolean = false) {
		// Update config
		config.value.saveLocation = location;
		await saveConfig();

		if (useExistingData) {
			// Load data from the new location
			await loadDataFromLocation(location);
		} else {
			// Save current data to the new location
			await saveData();
		}
	}

	return {
		ferments,
		settings,
		config,
		isLoading,
		activeFerments,
		archivedFerments,
		loadConfig,
		loadData,
		saveData,
		checkDataExistsAt,
		loadDataFromLocation,
		addFerment,
		updateFerment,
		deleteFerment,
		archiveFerment,
		unarchiveFerment,
		updateSettings,
		setSaveLocation
	};
};
