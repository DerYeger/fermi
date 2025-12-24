<template>
	<div>
		<div v-if="isLoading" class="flex justify-center py-12">
			<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
		</div>

		<div v-else-if="!ferment" class="text-center py-12">
			<UIcon name="lucide:alert-circle" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
			<p class="text-(--ui-text-muted) mb-4">
				Ferment not found
			</p>
			<UButton to="/">
				Back to Ferments
			</UButton>
		</div>

		<div v-else>
			<!-- Header -->
			<div class="flex items-start justify-between gap-4 mb-6">
				<div class="flex items-center gap-3">
					<UButton
						icon="lucide:arrow-left"
						variant="ghost"
						to="/"
					/>
					<div>
						<h1 class="text-2xl font-bold">
							{{ ferment.name }}
						</h1>
						<div class="flex items-center gap-2 mt-1">
							<UBadge v-if="ferment.isArchived" variant="subtle" color="neutral">
								Archived
							</UBadge>
							<span class="text-sm text-(--ui-text-muted)">
								{{ daysFermenting }} days
							</span>
						</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<UButton
						v-if="!ferment.isArchived"
						icon="lucide:pencil"
						variant="outline"
						@click="showEditModal = true"
					>
						Edit
					</UButton>
					<UButton
						v-if="!ferment.isArchived"
						icon="lucide:archive"
						variant="outline"
						@click="showArchiveModal = true"
					>
						Complete
					</UButton>
					<UButton
						v-else
						icon="lucide:archive-restore"
						variant="outline"
						@click="handleUnarchive"
					>
						Restore
					</UButton>
					<UButton
						icon="lucide:trash-2"
						variant="ghost"
						color="error"
						@click="showDeleteModal = true"
					/>
				</div>
			</div>

			<!-- Content -->
			<div class="grid gap-6 lg:grid-cols-3">
				<!-- Main content -->
				<div class="lg:col-span-2 space-y-6">
					<!-- Image -->
					<UCard v-if="ferment.imageBase64">
						<img
							:src="ferment.imageBase64"
							:alt="ferment.name"
							class="w-full max-h-96 object-cover rounded-lg"
						>
					</UCard>

					<!-- Notes -->
					<UCard v-if="ferment.notes">
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="lucide:notebook-pen" class="size-5" />
								<h2 class="font-semibold">
									Notes
								</h2>
							</div>
						</template>
						<p class="whitespace-pre-wrap">
							{{ ferment.notes }}
						</p>
					</UCard>

					<!-- Completion Notes (for archived) -->
					<UCard v-if="ferment.isArchived && ferment.completionNotes">
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="lucide:clipboard-check" class="size-5" />
								<h2 class="font-semibold">
									Completion Notes
								</h2>
							</div>
						</template>
						<p class="whitespace-pre-wrap">
							{{ ferment.completionNotes }}
						</p>
					</UCard>
				</div>

				<!-- Sidebar -->
				<div class="space-y-6">
					<!-- Rating (for archived) -->
					<UCard v-if="ferment.isArchived && ferment.rating">
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="lucide:star" class="size-5" />
								<h2 class="font-semibold">
									Rating
								</h2>
							</div>
						</template>
						<div class="flex items-center gap-1">
							<UIcon
								v-for="i in 5"
								:key="i"
								name="lucide:star"
								:class="i <= (ferment.rating || 0) ? 'text-yellow-500' : 'text-(--ui-text-muted)'"
								class="size-6"
							/>
						</div>
					</UCard>

					<!-- Details -->
					<UCard>
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="lucide:info" class="size-5" />
								<h2 class="font-semibold">
									Details
								</h2>
							</div>
						</template>
						<div class="space-y-4">
							<div>
								<div class="text-sm text-(--ui-text-muted) mb-1">
									Salt Ratio
								</div>
								<div class="font-medium">
									{{ ferment.saltRatio }}%
								</div>
							</div>
							<div>
								<div class="text-sm text-(--ui-text-muted) mb-1">
									Start Date
								</div>
								<div class="font-medium">
									{{ formatDate(ferment.startDate) }}
								</div>
							</div>
							<div v-if="ferment.endDate">
								<div class="text-sm text-(--ui-text-muted) mb-1">
									End Date
								</div>
								<div class="font-medium">
									{{ formatDate(ferment.endDate) }}
								</div>
							</div>
							<div>
								<div class="text-sm text-(--ui-text-muted) mb-1">
									Created
								</div>
								<div class="font-medium">
									{{ formatDateTime(ferment.createdAt) }}
								</div>
							</div>
							<div>
								<div class="text-sm text-(--ui-text-muted) mb-1">
									Last Updated
								</div>
								<div class="font-medium">
									{{ formatDateTime(ferment.updatedAt) }}
								</div>
							</div>
						</div>
					</UCard>

					<!-- Ingredients -->
					<UCard v-if="ferment.ingredients.length > 0">
						<template #header>
							<div class="flex items-center gap-2">
								<UIcon name="lucide:list" class="size-5" />
								<h2 class="font-semibold">
									Ingredients
								</h2>
							</div>
						</template>
						<div class="space-y-2">
							<div
								v-for="ingredient in ferment.ingredients"
								:key="ingredient.id"
								class="flex items-center justify-between py-2 border-b border-(--ui-border) last:border-0"
							>
								<span class="font-medium">{{ ingredient.name }}</span>
								<span v-if="ingredient.amount" class="text-sm text-(--ui-text-muted)">
									{{ ingredient.amount }} {{ ingredient.unit }}
								</span>
							</div>
						</div>
					</UCard>
				</div>
			</div>
		</div>

		<!-- Edit Modal -->
		<UModal v-model:open="showEditModal" title="Edit Ferment" :ui="{ width: 'sm:max-w-2xl' }">
			<template #body>
				<FermentForm
					:initial-data="ferment"
					@submit="handleEdit"
					@cancel="showEditModal = false"
				/>
			</template>
		</UModal>

		<!-- Archive Modal -->
		<UModal v-model:open="showArchiveModal" title="Complete Ferment">
			<template #body>
				<ArchiveForm
					@submit="handleArchive"
					@cancel="showArchiveModal = false"
				/>
			</template>
		</UModal>

		<!-- Delete Confirmation Modal -->
		<UModal v-model:open="showDeleteModal" title="Delete Ferment">
			<template #body>
				<p class="text-(--ui-text-muted) mb-6">
					Are you sure you want to delete "{{ ferment?.name }}"? This action cannot be undone.
				</p>
				<div class="flex justify-end gap-2">
					<UButton variant="ghost" @click="showDeleteModal = false">
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

	const route = useRoute();
	const router = useRouter();
	const { ferments, isLoading, updateFerment, archiveFerment, unarchiveFerment, deleteFerment } = useFermentationStore();

	const fermentId = computed(() => route.params.id as string);

	const ferment = computed(() => {
		return ferments.value.find((f) => f.id === fermentId.value);
	});

	const daysFermenting = computed(() => {
		if (!ferment.value) return 0;
		const start = new Date(ferment.value.startDate);
		const end = ferment.value.endDate ? new Date(ferment.value.endDate) : new Date();
		const diffTime = Math.abs(end.getTime() - start.getTime());
		return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	});

	const showEditModal = ref(false);
	const showArchiveModal = ref(false);
	const showDeleteModal = ref(false);

	const formatDate = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric"
		});
	};

	const formatDateTime = (dateStr: string) => {
		return new Date(dateStr).toLocaleDateString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "numeric",
			minute: "2-digit"
		});
	};

	const handleEdit = async (data: Omit<Ferment, "id" | "createdAt" | "updatedAt">) => {
		if (!ferment.value) return;
		await updateFerment(ferment.value.id, data);
		showEditModal.value = false;
	};

	const handleArchive = async (data: { rating: number, completionNotes: string }) => {
		if (!ferment.value) return;
		await archiveFerment(ferment.value.id, data.rating, data.completionNotes);
		showArchiveModal.value = false;
	};

	const handleUnarchive = async () => {
		if (!ferment.value) return;
		await unarchiveFerment(ferment.value.id);
	};

	const handleDelete = async () => {
		if (!ferment.value) return;
		await deleteFerment(ferment.value.id);
		showDeleteModal.value = false;
		router.push("/");
	};
</script>
