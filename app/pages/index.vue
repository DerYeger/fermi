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

			<div v-if="isLoadingActive" class="flex justify-center py-12">
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

		<div v-if="completedFerments.length > 0">
			<div class="flex items-center justify-between mb-6">
				<h2 class="text-2xl font-bold">
					Archived Ferments
				</h2>
				<UBadge variant="subtle">
					{{ completedFerments.length }}
				</UBadge>
			</div>

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<FermentCard
					v-for="ferment in completedFerments"
					:key="ferment.id"
					:ferment="ferment"
					@edit="openEditModal"
					@unarchive="handleUnarchive"
					@delete="confirmDelete"
				/>
			</div>
		</div>

		<!-- Add/Edit Ferment Modal -->
		<UModal v-model:open="showAddModal" title="Add New Ferment">
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
	import { transitionToActive, type ActiveFerment, type CompletedFerment, type Ferment, type FermentBase } from "~/types/ferment";
	import { nanoid } from "nanoid";

	const { data: activeFerments, isLoading: isLoadingActive } = useActiveFerments();
	const { data: completedFerments } = useCompletedFerments();
	const toast = useToast();

	const showAddModal = ref(false);
	const showArchiveModal = ref(false);
	const showDeleteConfirm = ref(false);
	const editingFerment = ref<Ferment | null>(null);
	const archivingFerment = ref<Ferment | null>(null);
	const deletingFerment = ref<Ferment | null>(null);

	function openEditModal(ferment: Ferment) {
		editingFerment.value = ferment;
		showAddModal.value = true;
	}

	function openArchiveModal(ferment: Ferment) {
		archivingFerment.value = ferment;
		showArchiveModal.value = true;
	}

	function closeModal() {
		showAddModal.value = false;
		editingFerment.value = null;
	}

	async function handleSubmit(data: Omit<FermentBase, "id" | "createdAt">) {
		try {
			if (editingFerment.value) {
        FermentCollection.update(editingFerment.value.id, (current) => {
          Object.assign(current, data);
        });
      } else {
        const newFerment: ActiveFerment = {
					...data,
					id: nanoid(),
					state: "active",
					createdAt: data.updatedAt
        }
				FermentCollection.insert(newFerment);
			}
			closeModal();
		} catch (error) {
			toast.add({ title: "Error saving ferment", description: String(error), color: "error" });
		}
	}

	async function handleArchive(data: CompletedFerment) {
		FermentCollection.update(data.id, (draft) => {
      Object.assign(draft, data);
    });
    showArchiveModal.value = false;
	}

	async function handleUnarchive(ferment: Ferment) {
		 if (ferment.state !== 'completed') return;
		FermentCollection.update(ferment.id, (current) => {
      Object.assign(current, transitionToActive(ferment));
    });
	}

	function confirmDelete(ferment: Ferment) {
		deletingFerment.value = ferment;
		showDeleteConfirm.value = true;
	}

	async function handleDelete() {
		if (!deletingFerment.value) return;
		FermentCollection.delete(deletingFerment.value.id);
	}
</script>
