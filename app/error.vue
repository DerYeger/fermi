<template>
	<AppBase>
		<UError
			:error="error"
		/>
	</AppBase>
</template>

<script setup lang="ts">
	import type { NuxtError } from "#app";
	import AppBase from "~/app-base.vue";

	defineProps<{
		error: NuxtError
	}>();
</script>
