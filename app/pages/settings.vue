<template>
	<div class="flex flex-col gap-4">
		<!-- Theme -->
		<UCard>
			<template #header>
				<CardHeader title="Theme" icon="hugeicons:gibbous-moon" />
			</template>

			<UColorModeSelect />
		</UCard>

		<!-- Save Location -->
		<UCard>
			<template #header>
				<CardHeader title="Data Storage" icon="hugeicons:folder-01" />
			</template>

			<div class="space-y-4">
				<p class="text-sm text-muted">
					Choose where your fermentation data is stored.
				</p>

				<UFormField label="Save location" name="saveLocation">
					<UFieldGroup class="w-full">
						<UInput
							v-model="dataDir"
							:placeholder="dataDirDisplay?.dir"
							readonly
							class="flex-1"
						/>
						<UButton variant="subtle" @click="selectFolder">
							Browse
						</UButton>
						<UButton
							v-if="dataDir"
							variant="subtle"
							color="error"
							icon="hugeicons:cancel-01"
							@click="clearSaveLocation"
						/>
					</UFieldGroup>
				</UFormField>

				<div class="flex items-end">
					<UButton
						variant="ghost"
						icon="hugeicons:folder-02"
						@click="openDataDirectory"
					>
						Open in File Browser
					</UButton>
				</div>
			</div>
		</UCard>

		<!-- Backup Settings -->
		<UCard>
			<template #header>
				<CardHeader title="Automatic Backups" icon="hugeicons:database-restore" />
			</template>

			<div class="space-y-4">
				<p class="text-sm text-muted">
					Automatic backups are created before each save. Configure how many backups to keep.
				</p>

				<UFormField label="Maximum backups" name="maxBackups">
					<UInput
						v-model.number="maxBackups"
						type="number"
						min="1"
						max="10"
						class="w-32"
					/>
				</UFormField>

				<p class="text-xs text-muted">
					Up to {{ maxBackups }} backup files will be kept. Older backups are automatically deleted.
				</p>
			</div>
		</UCard>

		<!-- About -->
		<UCard>
			<template #header>
				<CardHeader title="About Fermi" icon="hugeicons:information-square" />
			</template>

			<div class="space-y-2 text-sm text-muted">
				<p>
					Fermi is a simple fermentation tracking app to help you manage your fermentation projects.
				</p>
				<p>
					Track your ferments, record ingredients, and rate your results.
				</p>
			</div>
		</UCard>
	</div>
</template>

<script lang="ts" setup>
	import { FERMI_CONFIG_DEFAULTS } from "~/types/config";
	import { getErrorMessage } from "~/types/utils";

	const toast = useToast();

	const { maxBackups, dataDir } = useFermiConfig();

	const { data: dataDirDisplay } = useAsyncData("dataDirDisplay", async () => {
		const dir = await getDataDir();
		return { dir, isDefault: dataDir.value === FERMI_CONFIG_DEFAULTS.dataDir };
	}, { immediate: true });

	async function selectFolder() {
		try {
			const selected = await useTauriDialogOpen({
				directory: true,
				multiple: false,
				title: "Select Data Storage Folder"
			});
			if (selected && typeof selected === "string") {
				dataDir.value = selected;
				toast.add({
					title: "Save location updated",
					color: "success"
				});
			}
		} catch (error) {
			toast.add({ title: "Error updating save location", description: getErrorMessage(error), color: "error" });
		}
	}

	async function clearSaveLocation() {
		dataDir.value = FERMI_CONFIG_DEFAULTS.dataDir;
		toast.add({ title: "Save location reset to default", color: "success" });
	}

	async function openDataDirectory() {
		try {
			let path = await getDataDir();
			const fileProtocol = "file://";
			if (!path.startsWith(fileProtocol)) {
				path = fileProtocol + path;
			}
			await useTauriShellOpen(path);
		} catch (error) {
			toast.add({ title: "Error opening directory", description: getErrorMessage(error), color: "error" });
		}
	}
</script>
