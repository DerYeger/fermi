<template>
	<UMain class="select-none">
		<UDashboardGroup>
			<UDashboardPanel :ui="{ body: 'sm:p-4' }">
				<template #header>
					<UDashboardToolbar>
						<template #left>
							<UNavigationMenu highlight :items="sidebarItems" :ui="{ item: 'max-md:[&_span.truncate]:hidden' }" />
						</template>
						<template #right>
							<NewFermentButton with-shortcut />
						</template>
					</UDashboardToolbar>
				</template>
				<template #body>
					<slot />
				</template>
			</UDashboardPanel>
		</UDashboardGroup>
	</UMain>
</template>

<script setup lang="ts">
	import type { NavigationMenuItem } from "@nuxt/ui";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const sidebarItems: NavigationMenuItem[] = [
		{
			type: "link",
			label: "Dashboard",
			icon: "lucide:home",
			to: "/"
		},
		{
			type: "link",
			label: "Ferments",
			icon: "lucide:salad",
			to: "/ferments"
		},
		{ type: "link", label: "Archive", icon: "lucide:archive", to: "/archive" },
		{ type: "link", label: "Settings", icon: "lucide:settings-2", to: "/settings" }
	];
</script>
