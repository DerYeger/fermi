import type { AppSettings, Ferment, FermentationData } from "~/types/ferment";
import { defaultSettings, generateId } from "~/types/ferment";

const DATA_FILENAME = "fermentation-data.json";
const BACKUP_PREFIX = "fermentation-backup-";

export const useFermentationStore = () => {
	const ferments = useState<Ferment[]>("ferments", () => []);
	const settings = useState<AppSettings>("settings", () => ({ ...defaultSettings }));
	const isLoading = useState<boolean>("isLoading", () => true);
	const saveLocation = useState<string>("saveLocation", () => "");

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

	const getDataFilePath = () => {
		if (saveLocation.value) {
			return `${saveLocation.value}/${DATA_FILENAME}`;
		}
		return DATA_FILENAME;
	};

	const getBackupFilePath = (index: number) => {
		if (saveLocation.value) {
			return `${saveLocation.value}/${BACKUP_PREFIX}${index}.json`;
		}
		return `${BACKUP_PREFIX}${index}.json`;
	};

	const getBaseDir = () => {
		return saveLocation.value ? undefined : useTauriFsBaseDirectory.AppData;
	};

	const createBackup = async () => {
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
	};

	const saveData = async () => {
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
	};

	const loadData = async () => {
		isLoading.value = true;
		try {
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
	};

	const addFerment = async (ferment: Omit<Ferment, "id" | "createdAt" | "updatedAt">) => {
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
	};

	const updateFerment = async (id: string, updates: Partial<Ferment>) => {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			const ferment = ferments.value[index];
			Object.assign(ferment, updates, { updatedAt: new Date().toISOString() });
			await saveData();
		}
	};

	const deleteFerment = async (id: string) => {
		const index = ferments.value.findIndex((f) => f.id === id);
		if (index !== -1) {
			ferments.value.splice(index, 1);
			await saveData();
		}
	};

	const archiveFerment = async (id: string, rating: number, completionNotes: string) => {
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
	};

	const unarchiveFerment = async (id: string) => {
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
	};

	const updateSettings = async (newSettings: Partial<AppSettings>) => {
		const oldLocation = saveLocation.value;
		settings.value = { ...settings.value, ...newSettings };

		if (newSettings.saveLocation !== undefined) {
			saveLocation.value = newSettings.saveLocation;
			// If location changed, save data to new location
			if (oldLocation !== newSettings.saveLocation) {
				await saveData();
			}
		} else {
			await saveData();
		}
	};

	const setSaveLocation = async (location: string) => {
		saveLocation.value = location;
		settings.value.saveLocation = location;
		await saveData();
	};

	return {
		ferments,
		settings,
		isLoading,
		saveLocation,
		activeFerments,
		archivedFerments,
		loadData,
		saveData,
		addFerment,
		updateFerment,
		deleteFerment,
		archiveFerment,
		unarchiveFerment,
		updateSettings,
		setSaveLocation
	};
};
