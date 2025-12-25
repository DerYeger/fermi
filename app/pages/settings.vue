<template>
	<div class="space-y-8">
		<!-- Save Location -->
		<UCard>
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="lucide:folder" class="size-5" />
					<span class="font-semibold">Data Storage</span>
				</div>
			</template>

			<div class="space-y-4">
				<p class="text-sm text-(--ui-text-muted)">
					Choose where your fermentation data is stored. The default location is in the app's data directory.
				</p>

				<UFormField label="Save Location" name="saveLocation">
					<div class="flex gap-2">
						<UInput
							v-model="dataDir"
							placeholder="Default: App Data Directory"
							readonly
							class="flex-1"
						/>
						<UButton variant="outline" @click="selectFolder">
							Browse
						</UButton>
						<UButton
							v-if="dataDir"
							variant="ghost"
							icon="lucide:x"
							@click="clearSaveLocation"
						/>
					</div>
				</UFormField>

				<div class="flex items-center justify-between">
					<p class="text-xs text-(--ui-text-muted)">
						Current location: {{ dataDirDisplay }}
					</p>
					<UButton
						variant="ghost"
						size="sm"
						icon="lucide:folder-open"
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
				<div class="flex items-center gap-2">
					<UIcon name="lucide:archive" class="size-5" />
					<span class="font-semibold">Automatic Backups</span>
				</div>
			</template>

			<div class="space-y-4">
				<p class="text-sm text-(--ui-text-muted)">
					Automatic backups are created before each save. Configure how many backups to keep.
				</p>

				<UFormField label="Maximum Backups" name="maxBackups">
					<UInput
						v-model.number="maxBackups"
						type="number"
						min="1"
						max="10"
						class="w-32"
					/>
				</UFormField>

				<p class="text-xs text-(--ui-text-muted)">
					Up to {{ maxBackups }} backup files will be kept. Older backups are automatically deleted.
				</p>
			</div>
		</UCard>

		<!-- About -->
		<UCard>
			<template #header>
				<div class="flex items-center gap-2">
					<UIcon name="lucide:info" class="size-5" />
					<span class="font-semibold">About Fermi</span>
				</div>
			</template>

			<div class="space-y-2 text-sm text-(--ui-text-muted)">
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

	const toast = useToast();

	const { maxBackups, dataDir } = useFermiConfig();

	const dataDirDisplay = computed(() => {
		return dataDir.value || "App Data Directory (default)";
	});

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
			toast.add({ title: "Error updating save location", description: String(error), color: "error" });
		}
	}

	async function clearSaveLocation() {
		dataDir.value = FERMI_CONFIG_DEFAULTS.dataDir;
		toast.add({ title: "Save location reset to default", color: "success" });
	}

	async function openDataDirectory() {
		try {
			let path = dataDir.value;
			if (!path) {
				// Get the app data directory path
				path = await useTauriPathAppDataDir();
			}
			const fileProtocol = "file://";
			if (!path.startsWith(fileProtocol)) {
				path = fileProtocol + path;
			}
			await useTauriShellOpen(path);
		} catch (error) {
			toast.add({ title: "Error opening directory", description: String(error), color: "error" });
		}
	}
</script>
