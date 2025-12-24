<template>
	<div>
		<div class="mb-6">
			<NuxtLink to="/" class="inline-flex items-center gap-2 text-(--ui-text-muted) hover:text-(--ui-text) transition-colors">
				<UIcon name="lucide:arrow-left" class="size-4" />
				Back to Ferments
			</NuxtLink>
		</div>

		<h1 class="text-2xl font-bold mb-6">
			Settings
		</h1>

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
								v-model="saveLocation"
								placeholder="Default: App Data Directory"
								readonly
								class="flex-1"
							/>
							<UButton variant="outline" @click="selectFolder">
								Browse
							</UButton>
							<UButton
								v-if="saveLocation"
								variant="ghost"
								icon="lucide:x"
								@click="clearSaveLocation"
							/>
						</div>
					</UFormField>

					<div class="flex items-center justify-between">
						<p class="text-xs text-(--ui-text-muted)">
							Current location: {{ displayLocation }}
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
	</div>
</template>

<script lang="ts" setup>
	const store = useFermentationStore();
	const toast = useToast();

	const saveLocation = ref(store.settings.value.saveLocation);
	const maxBackups = ref(store.settings.value.maxBackups);

	const displayLocation = computed(() => {
		return saveLocation.value || "App Data Directory (default)";
	});

	onMounted(async () => {
		await store.loadData();
		saveLocation.value = store.settings.value.saveLocation;
		maxBackups.value = store.settings.value.maxBackups;
	});

	watch(maxBackups, async (newValue) => {
		if (newValue >= 1 && newValue <= 10) {
			try {
				await store.updateSettings({ maxBackups: newValue });
				toast.add({ title: "Settings saved", color: "success" });
			} catch (error) {
				toast.add({ title: "Error saving settings", description: String(error), color: "error" });
			}
		}
	});

	const selectFolder = async () => {
		try {
			const selected = await useTauriDialogOpen({
				directory: true,
				multiple: false,
				title: "Select Data Storage Folder"
			});
			if (selected && typeof selected === "string") {
				saveLocation.value = selected;
				await store.setSaveLocation(selected);
				toast.add({ title: "Save location updated", color: "success" });
			}
		} catch (error) {
			toast.add({ title: "Error setting save location", description: String(error), color: "error" });
		}
	};

	const clearSaveLocation = async () => {
		try {
			saveLocation.value = "";
			await store.setSaveLocation("");
			toast.add({ title: "Save location reset to default", color: "success" });
		} catch (error) {
			toast.add({ title: "Error resetting save location", description: String(error), color: "error" });
		}
	};

	const openDataDirectory = async () => {
		try {
			let path = saveLocation.value;
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
	};
</script>
