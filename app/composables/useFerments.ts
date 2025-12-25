import type { DirEntry } from "@tauri-apps/plugin-fs";
import type { Ferment, FermentState } from "~/types/ferment";
import { queryCollectionOptions } from "@tanstack/query-db-collection";
import { createCollection, eq, useLiveQuery } from "@tanstack/vue-db";
import { queryClient, queryKeys } from "~/queryClient";
import { FermentSchema } from "~/types/ferment";

const DATA_FILENAME = "data.json";

const toast = useToast()
const { dataDir } = useFermiConfig();

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
          description: String(error)
        })
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
          description: String(error)
        })
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
            description: String(error)
          })
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
	return useFermentsByState("active");
}

export function useCompletedFerments() {
	return useFermentsByState("completed");
}

function useFermentsByState(state: FermentState) {
	return useLiveQuery((q) => q.from({ ferment: FermentCollection }).where(({ ferment }) => eq(ferment.state, state)));
}

export function useFermentById(id: MaybeRefOrGetter<string>) {
  return useLiveQuery((q) => q.from({ ferment: FermentCollection }).where(({ ferment }) => eq(ferment.id, unref(id))).findOne());
}

async function loadAllFerments() {
	let dirs: DirEntry[] = [];
	if (dataDir.value) {
		dirs = await useTauriFsReadDir(dataDir.value);
	} else {
		dirs = await useTauriFsReadDir("", { baseDir: useTauriFsBaseDirectory.AppData });
	}
	return Promise.all(dirs.filter((dir) => dir.isDirectory).map((dir) => loadFermentById(dir.name)));
}

async function loadFermentById(id: string) {
	const path = getFermentDataPath(id);
	let content: string;
	if (dataDir.value) {
    content = await useTauriFsReadTextFile(`${dataDir.value}/${path}`);
	} else {
		content = await useTauriFsReadTextFile(path, { baseDir: useTauriFsBaseDirectory.AppData });
	}
	return JSON.parse(content);
}

async function writeFermentData(data: Ferment) {
  await ensureFermentDataExists(data.id);
	const path = getFermentDataPath(data.id);
	const content = JSON.stringify(data, null, 2);
	if (dataDir.value) {
    await useTauriFsWriteTextFile(`${dataDir.value}/${path}`, content);
	} else {
		await useTauriFsWriteTextFile(path, content, { baseDir: useTauriFsBaseDirectory.AppData });
	}
}

async function deleteFermentById(id: string) {
	const path = getFermentPath(id);
	if (dataDir.value) {
    await useTauriFsRemove(`${dataDir.value}/${path}`, { recursive: true });
	} else {
		await useTauriFsRemove(path, { baseDir: useTauriFsBaseDirectory.AppData, recursive: true });
	}
}

async function ensureFermentDataExists(id: string) {
  const path = getFermentPath(id);
  if (dataDir.value) {
    await useTauriFsMkdir(`${dataDir.value}/${path}`, { recursive: true });
  }
  else {
    await useTauriFsMkdir(path, { baseDir: useTauriFsBaseDirectory.AppData, recursive: true });
  }
}

function getFermentPath(id: string) {
	return `${id}`;
}

function getFermentDataPath(id: string) {
	return `${getFermentPath(id)}/${DATA_FILENAME}`;
}
