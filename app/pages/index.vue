<template>
	<div>
		<div class="mb-8">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold">
					Active Ferments
				</h1>
				<UButton icon="lucide:plus" @click="showAddModal = true">
					New Ferment
				</UButton>
			</div>

			<div v-if="isLoading" class="flex justify-center py-12">
				<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
			</div>

			<div v-else-if="activeFerments.length === 0" class="text-center py-12">
				<UIcon name="lucide:flask-conical" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
				<p class="text-(--ui-text-muted) mb-4">
					No active ferments yet
				</p>
				<UButton @click="showAddModal = true">
					Start Your First Ferment
				</UButton>
			</div>

			<div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FermentCard
					v-for="ferment in activeFerments"
					:key="ferment.id"
					:ferment="ferment"
					@edit="openEditModal"
					@archive="openArchiveModal"
					@delete="confirmDelete"
				/>
			</div>
		</div>

		<div v-if="archivedFerments.length > 0">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold">
					Archived Ferments
				</h2>
				<UBadge variant="subtle">
					{{ archivedFerments.length }}
				</UBadge>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FermentCard
					v-for="ferment in archivedFerments"
					:key="ferment.id"
					:ferment="ferment"
					@edit="openEditModal"
					@unarchive="handleUnarchive"
					@delete="confirmDelete"
				/>
			</div>
		</div>

		<!-- Add/Edit Ferment Modal -->
		<UModal v-model:open="showAddModal" title="Add New Ferment" :ui="{ width: 'sm:max-w-2xl' }">
			<template #body>
				<FermentForm
					:initial-data="editingFerment"
					@submit="handleSubmit"
					@cancel="closeModal"
				/>
			</template>
		</UModal>

		<!-- Archive Modal -->
		<UModal v-model:open="showArchiveModal" title="Complete Ferment">
			<template #body>
				<ArchiveForm
					v-if="archivingFerment"
					:ferment="archivingFerment"
					@submit="handleArchive"
					@cancel="showArchiveModal = false"
				/>
			</template>
		</UModal>

		<!-- Delete Confirmation -->
		<UModal v-model:open="showDeleteConfirm" title="Delete Ferment">
			<template #body>
				<p class="text-(--ui-text-muted) mb-6">
					Are you sure you want to delete "{{ deletingFerment?.name }}"? This action cannot be undone.
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="ghost" @click="showDeleteConfirm = false">
						Cancel
					</UButton>
					<UButton color="error" @click="handleDelete">
						Delete
					</UButton>
				</div>
			</template>
		</UModal>
	</div>
</template>

<script lang="ts" setup>
	import type { Ferment } from "~/types/ferment";

	const store = useFermentationStore();
	const { activeFerments, archivedFerments, isLoading } = store;
	const toast = useToast();

	const showAddModal = ref(false);
	const showArchiveModal = ref(false);
	const showDeleteConfirm = ref(false);
	const editingFerment = ref<Ferment | null>(null);
	const archivingFerment = ref<Ferment | null>(null);
	const deletingFerment = ref<Ferment | null>(null);

	onMounted(async () => {
		await store.loadData();
	});

	const openEditModal = (ferment: Ferment) => {
		editingFerment.value = ferment;
		showAddModal.value = true;
	};

	const openArchiveModal = (ferment: Ferment) => {
		archivingFerment.value = ferment;
		showArchiveModal.value = true;
	};

	const closeModal = () => {
		showAddModal.value = false;
		editingFerment.value = null;
	};

	const handleSubmit = async (data: Omit<Ferment, "id" | "createdAt" | "updatedAt">) => {
		try {
			if (editingFerment.value) {
				await store.updateFerment(editingFerment.value.id, data);
				toast.add({ title: "Ferment updated", color: "success" });
			} else {
				await store.addFerment(data);
				toast.add({ title: "Ferment added", color: "success" });
			}
			closeModal();
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: String(error), color: "error" });
		}
	};

	const handleArchive = async (data: { rating: number, notes: string }) => {
		if (!archivingFerment.value) return;
		try {
			await store.archiveFerment(archivingFerment.value.id, data.rating, data.notes);
			toast.add({ title: "Ferment archived", color: "success" });
			showArchiveModal.value = false;
			archivingFerment.value = null;
		} catch (error) {
			toast.add({ title: "Error archiving ferment", description: String(error), color: "error" });
		}
	};

	const handleUnarchive = async (ferment: Ferment) => {
		try {
			await store.unarchiveFerment(ferment.id);
			toast.add({ title: "Ferment restored to active", color: "success" });
		} catch (error) {
			toast.add({ title: "Error restoring ferment", description: String(error), color: "error" });
		}
	};

	const confirmDelete = (ferment: Ferment) => {
		deletingFerment.value = ferment;
		showDeleteConfirm.value = true;
	};

	const handleDelete = async () => {
		if (!deletingFerment.value) return;
		try {
			await store.deleteFerment(deletingFerment.value.id);
			toast.add({ title: "Ferment deleted", color: "success" });
			showDeleteConfirm.value = false;
			deletingFerment.value = null;
		} catch (error) {
			toast.add({ title: "Error deleting ferment", description: String(error), color: "error" });
		}
	};
</script>
