<template>
	<div v-if="isLoading" class="flex justify-center py-12">
		<UIcon name="lucide:loader-2" class="size-8 animate-spin text-(--ui-text-muted)" />
	</div>

	<div v-else-if="data.length === 0" class="text-center py-12">
		<UIcon name="lucide:flask-conical" class="size-16 mx-auto mb-4 text-(--ui-text-muted)" />
		<p class="text-(--ui-text-muted) mb-4">
			No archived ferments yet
		</p>
		<NewFermentButton>
			Start Your First Ferment
		</NewFermentButton>
	</div>

	<UTable v-else :data="data as CompletedFerment[]" class="flex-1" :columns="columns" />
</template>

<script setup lang="ts">
	import type { TableColumn } from "@nuxt/ui";
	import type { CompletedFerment } from "~/types/ferment";

	const { data, isLoading } = useCompletedFerments();

	const columns: TableColumn<CompletedFerment>[] = [
		{
			header: "Name",
			id: "name",
			accessorFn: (row) => row.name,
			enableSorting: true
		},
		{
			header: "Ingredients",
			id: "ingredients",
			// TODO: Use badges
			accessorFn: (row) => row.ingredients.map((ing) => ing.name).join(", "),
			enableSorting: false
		},
		{
			header: "Salt",
			id: "saltRatio",
			accessorFn: (row) => `${row.saltRatio}%`,
			enableSorting: true
		},
		{
			header: "Duration",
			id: "duration",
			accessorFn: (row) => {
				// TODO: Simplify
				const start = new Date(row.startDate);
				const end = row.endDate ? new Date(row.endDate) : new Date();
				const diffTime = Math.abs(end.getTime() - start.getTime());
				const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
				return `${diffDays} days`;
			},
			enableSorting: true
		},
		{
			// TODO: Render star icons with notes as tooltip
			header: "Overall",
			id: "overall",
			accessorFn: (row) => row.overall.stars,
			enableSorting: true
		},
		{
			header: "Flavor",
			id: "flavor",
			accessorFn: (row) => row.flavor.stars,
			enableSorting: true
		},
		{
			header: "Texture",
			id: "texture",
			accessorFn: (row) => row.texture.stars,
			enableSorting: true
		},
		{
			header: "Process",
			id: "process",
			accessorFn: (row) => row.process.stars,
			enableSorting: true
		},
		{
			header: "Start Date",
			id: "startDate",
			accessorFn: (row) => row.startDate,
			enableSorting: true
		},
		{
			header: "End Date",
			id: "endDate",
			accessorFn: (row) => row.endDate,
			enableSorting: true
		},
		{
			header: "Created At",
			id: "createdAt",
			accessorFn: (row) => row.createdAt,
			enableSorting: true
		},
		{
			header: "Updated At",
			id: "updatedAt",
			accessorFn: (row) => row.updatedAt,
			enableSorting: true
		}
	];
</script>
