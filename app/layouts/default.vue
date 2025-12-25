<template>
	<UApp>
		<UMain>
			<UDashboardGroup>
				<UDashboardSidebar :items="sidebarItems">
					<UNavigationMenu :items="sidebarItems" orientation="vertical" />
				</UDashboardSidebar>
				<UDashboardPanel>
					<template #header>
						<UDashboardNavbar :title="routeTitle">
							<template #right>
								<NewFermentButton />
							</template>
						</UDashboardNavbar>
					</template>
					<template #body>
						<div class="pa-2">
							<slot />
						</div>
					</template>
				</UDashboardPanel>
			</UDashboardGroup>
		</UMain>
	</UApp>
</template>

<script setup lang="ts">
	import type { NavigationMenuItem } from "@nuxt/ui";

	const sidebarItems: NavigationMenuItem[] = [
		{
			label: "Dashboard",
			icon: "lucide:home",
			to: "/"
		},
		{
			label: "Ferments",
			icon: "lucide:apple",
			to: "/ferments"
		},
		{
			label: "Archive",
			icon: "lucide:archive",
			to: "/archive"
		},
		{
			label: "Settings",
			icon: "lucide:settings-2",
			to: "/settings"
		}
	];

	const route = useRoute();

	const routeTitle = computed(() => {
		const routeName = route.name;
		return {
			index: "Dashboard",
			ferments: "Ferments",
			"ferment-id": "Ferment Details",
			archive: "Archive",
			settings: "Settings"
		}[routeName];
	});
</script>
