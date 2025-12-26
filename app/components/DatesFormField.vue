<template>
	<div class="grid grid-cols-2 gap-4">
		<UFormField label="Start date" name="startDate" required>
			<UInput v-model="startDate" type="date" />
		</UFormField>
		<UFormField label="End date" name="endDate" :required="isEndDateRequired">
			<div class="flex gap-2">
				<UInput v-model="endDate" type="date" class="flex-1" />
				<UButton
					v-if="!isEndDateRequired && endDate"
					icon="lucide:x"
					variant="ghost"
					color="neutral"
					@click="endDate = ''"
				/>
			</div>
		</UFormField>
	</div>
</template>

<script setup lang="ts">
	const { isEndDateRequired = false } = defineProps<{
		isEndDateRequired?: boolean
	}>();

	const startDate = defineModel<string>("startDate", {
		required: true
	});

	const endDate = defineModel<string>("endDate", {
		required: false
	});
</script>
