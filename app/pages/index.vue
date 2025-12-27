<template>
	<Loader v-if="isLoading" />

	<Empty v-else-if="ferments.length === 0" type="all" />

	<div v-else class="grid grid-flow-row-dense gap-4 sm:gap-6 sm:grid-cols-8 lg:grid-cols-12">
		<div class="col-span-4 row-span-2">
			<IngredientsChart />
		</div>
		<div class="col-span-4 row-span-2 ">
			<FermentCalendar />
		</div>
		<div class="col-span-4">
			<OverdueFerments />
		</div>
	</div>
</template>

<script lang="ts" setup>
	import FermentCalendar from "~/components/Dashboard/FermentCalendar.vue";
	import IngredientsChart from "~/components/Dashboard/IngredientsChart.vue";
	import OverdueFerments from "~/components/Dashboard/OverdueFerments.vue";

	const { data: ferments, isLoading } = useFerments();
</script>
