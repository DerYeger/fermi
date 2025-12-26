<template>
	<Html class="overflow-x-hidden">
		<Body class="font-sans antialiased">
			<UApp>
				<NuxtLayout>
					<UError
						:error="error"
					/>
				</NuxtLayout>
			</UApp>
		</Body>
	</Html>
</template>

<script setup lang="ts">
	import type { NuxtError } from "#app";

	defineProps<{
		error: NuxtError
	}>();
</script>
