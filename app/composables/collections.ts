import type { Ferment } from "~/types/ferment";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection } from "@tanstack/vue-db";
import { queryClient, queryKeys } from "~/queryClient";
import { FermentSchema } from "~/types/ferment";
import { getErrorMessage } from "~/types/utils";

const FERMENT_DIR_PREFIX = "fermi_";
const DATA_FILENAME = "data.json";

const { dataDir, maxBackups } = useFermiConfig();

export const FermentCollection = createCollection(
	queryCollectionOptions({
		queryClient,
		schema: FermentSchema,
		queryKey: queryKeys.ferments.all,
		queryFn: async () => await loadAllFerments(),
		getKey: (item) => item.id,
		onInsert: async ({ transaction }) => {
			try {
				await Promise.all(transaction.mutations.map(async (mutation) => {
					const ferment = mutation.modified;
					await writeFermentData(ferment);
				}));
			} catch (error) {
				useToast().add({
					color: "error",
					title: "Failed to save",
					description: getErrorMessage(error)
				});
			}
		},
		onUpdate: async ({ transaction }) => {
			try {
				await Promise.all(transaction.mutations.map(async (mutation) => {
					const ferment = mutation.modified;
					await writeFermentData(ferment);
				}));
			} catch (error) {
				useToast().add({
					color: "error",
					title: "Failed to update",
					description: getErrorMessage(error)
				});
			}
		},
		onDelete: async ({ transaction }) => {
			try {
				await Promise.all(transaction.mutations.map(async (mutation) => {
					const ferment = mutation.modified;
					await deleteFermentById(ferment.id);
				}));
			} catch (error) {
				useToast().add({
					color: "error",
					title: "Failed to delete",
					description: getErrorMessage(error)
				});
			}
		}
	})
);

watch(dataDir, () => {
	queryClient.invalidateQueries({ queryKey: ["ferments"] });
});

let loadFailuresNotified = false;

async function loadAllFerments(): Promise<Ferment[]> {
	const dataDir = await getDataDir();
	await useTauriFsMkdir(dataDir, { recursive: true });
	const allDirs = await useTauriFsReadDir(dataDir);
	const fermentIds = allDirs.filter((dir) => dir.isDirectory && dir.name.startsWith(FERMENT_DIR_PREFIX)).map((dir) => dir.name.substring(FERMENT_DIR_PREFIX.length));
	const parsed = await Promise.allSettled(
		fermentIds.map((id) => loadFermentById(id))
	);
	const ferments: Ferment[] = [];
	const failed: string[] = [];
	parsed.forEach((result, index) => {
		if (result.status === "fulfilled") {
			ferments.push(result.value);
		} else {
			failed.push(fermentIds[index]!);
		}
	});
	if (!loadFailuresNotified && failed.length > 0) {
		loadFailuresNotified = true;
		const toast = useToast();
		toast.add({
			color: "warning",
			title: "Some ferments failed to load",
			description: `${failed.length} ferment${failed.length > 1 ? "s" : ""} have invalid data.`,
			actions: [{
				label: "Delete",
				variant: "subtle",
				color: "error",
				onClick: async () => {
					try {
						await Promise.all(
							failed.map((id) => deleteFermentById(id))
						);
						toast.add({
							color: "success",
							title: "Invalid ferments deleted"
						});
					} catch (error) {
						toast.add({
							color: "error",
							title: "Failed to delete invalid ferments",
							description: getErrorMessage(error)
						});
					}
				}
			}]
		});
	}
	return ferments;
}

async function loadFermentById(id: string) {
	const path = await getFermentFile(id);
	const content: string = await useTauriFsReadTextFile(path);
	return FermentSchema.parse(JSON.parse(content));
}

async function writeFermentData(data: Ferment) {
	await ensureFermentDirExists(data.id);
	await createBackup(data.id);
	const content = JSON.stringify(data, null, 2);
	const path = await getFermentFile(data.id);
	await useTauriFsWriteTextFile(path, content);
}

async function deleteFermentById(id: string) {
	const path = await getFermentDir(id);
	await useTauriFsRemove(path, { recursive: true });
}

async function ensureFermentDirExists(id: string) {
	const path = await getFermentDir(id);
	await useTauriFsMkdir(path, { recursive: true });
}

async function createBackup(id: string) {
	try {
		const dataPath = await getFermentFile(id);

		const exists = await useTauriFsExists(dataPath);
		if (!exists) return;

		const currentData = await useTauriFsReadTextFile(dataPath);

		// Rotate backups (shift all backups up by 1, delete oldest if exceeds max)
		for (let i = maxBackups.value - 1; i >= 1; i--) {
			const oldPath = await getBackupFilePath(id, i);
			const newPath = await getBackupFilePath(id, i + 1);

			const oldExists = await useTauriFsExists(oldPath);
			if (oldExists) {
				if (i + 1 > maxBackups.value) {
					await useTauriFsRemove(oldPath);
				} else {
					const backupData = await useTauriFsReadTextFile(oldPath);
					await useTauriFsWriteTextFile(newPath, backupData);
				}
			}
		}

		// Create new backup at position 1
		await useTauriFsWriteTextFile(await getBackupFilePath(id, 1), currentData);
	} catch (error) {
		console.error("Failed to create backup:", error);
	}
}

export async function getDataDir() {
	if (dataDir.value) {
		return dataDir.value;
	}
	return `${await useTauriPathDocumentDir()}/dev.janmueller.fermi`;
}

async function getFermentDir(id: string) {
	return `${await getDataDir()}/${FERMENT_DIR_PREFIX}${id}`;
}

async function getFermentFile(id: string) {
	return `${await getFermentDir(id)}/${DATA_FILENAME}`;
}

async function getBackupFilePath(id: string, backupIndex: number) {
	return `${await getFermentDir(id)}/backup_${backupIndex}.json`;
}
