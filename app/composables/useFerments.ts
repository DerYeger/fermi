import type { Ferment } from "~/types/ferment";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, useLiveQuery } from "@tanstack/vue-db";
import { Stream } from "@yeger/streams/sync";
import { queryClient, queryKeys } from "~/queryClient";
import { FermentSchema } from "~/types/ferment";
import { getErrorMessage } from "~/types/utils";

const DATA_FILENAME = "data.json";

const toast = useToast();
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
				toast.add({
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
				toast.add({
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
				toast.add({
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

export function useFerments() {
	return useLiveQuery((q) => q.from({ ferment: FermentCollection }));
}

export function useActiveFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.state, "active"))
			.orderBy(({ ferment }) => ferment.startDate, "asc")
	);
}

export function useCompletedFerments() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.where(({ ferment }) => eq(ferment.state, "completed"))
			.orderBy(({ ferment }) => ferment.endDate, "desc")
	);
}

export function useFermentById(id: MaybeRefOrGetter<string>) {
	return useLiveQuery((q) => q.from({ ferment: FermentCollection }).where(({ ferment }) => eq(ferment.id, unref(id))).findOne());
}

function useIngredients() {
	return useLiveQuery((q) =>
		q.from({ ferment: FermentCollection })
			.select(({ ferment }) => ({ ingredients: ferment.ingredients }))
	);
}

export function useFermentNames(otherNames: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useLiveQuery((q) => q.from({ ferment: FermentCollection }).select(({ ferment }) => ({ name: ferment.name })));
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.map((item) => item.name)
			.concat(toValue(otherNames))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
	);
}

export function useIngredientNames(otherNames: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.flatMap((item) => item.ingredients)
			.map((ingredient) => ingredient.name)
			.concat(toValue(otherNames))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
	);
}

export function useUnits(otherUnits: MaybeRefOrGetter<string[]>): ComputedRef<string[]> {
	const query = useIngredients();
	return computed(() =>
		Stream.from(query.data.value ?? [])
			.flatMap((item) => item.ingredients)
			.map((ingredient) => ingredient.unit)
			.concat(toValue(otherUnits))
			.distinct()
			.toArray()
			.sort((a, b) => a.localeCompare(b))
	);
}

async function loadAllFerments() {
	const dirs = await useTauriFsReadDir(dataDir.value || "", getOptions());
	return Promise.all(dirs.filter((dir) => dir.isDirectory).map((dir) => loadFermentById(dir.name)));
}

async function loadFermentById(id: string) {
	const content: string = await useTauriFsReadTextFile(getFermentFile(id), getOptions());
	return JSON.parse(content);
}

async function writeFermentData(data: Ferment) {
	await ensureFermentDirExists(data.id);
	await createBackup(data.id);
	const content = JSON.stringify(data, null, 2);
	await useTauriFsWriteTextFile(getFermentFile(data.id), content, getOptions());
}

async function deleteFermentById(id: string) {
	await useTauriFsRemove(getFermentDir(id), { ...getOptions(), recursive: true });
}

async function ensureFermentDirExists(id: string) {
	await useTauriFsMkdir(getFermentDir(id), { ...getOptions(), recursive: true });
}

async function createBackup(id: string) {
	try {
		const dataPath = getFermentFile(id);

		const exists = await useTauriFsExists(dataPath, getOptions());
		if (!exists) return;

		const currentData = await useTauriFsReadTextFile(dataPath, getOptions());

		// Rotate backups (shift all backups up by 1, delete oldest if exceeds max)
		for (let i = maxBackups.value - 1; i >= 1; i--) {
			const oldPath = getBackupFilePath(id, i);
			const newPath = getBackupFilePath(id, i + 1);

			const oldExists = await useTauriFsExists(oldPath, getOptions());
			if (oldExists) {
				if (i + 1 > maxBackups.value) {
					await useTauriFsRemove(oldPath, getOptions());
				} else {
					const backupData = await useTauriFsReadTextFile(oldPath, getOptions());
					await useTauriFsWriteTextFile(newPath, backupData, getOptions());
				}
			}
		}

		// Create new backup at position 1
		await useTauriFsWriteTextFile(getBackupFilePath(id, 1), currentData, getOptions());
	} catch (error) {
		console.error("Failed to create backup:", error);
	}
}

function getFermentDir(id: string) {
	if (dataDir.value) {
		return `${dataDir.value}/${id}`;
	}
	return `${id}`;
}

function getFermentFile(id: string) {
	return `${getFermentDir(id)}/${DATA_FILENAME}`;
}

function getOptions() {
	return dataDir.value ? {} : { baseDir: useTauriFsBaseDirectory.AppData };
}

function getBackupFilePath(id: string, backupIndex: number) {
	return `${getFermentDir(id)}/backup_${backupIndex}.json`;
}
