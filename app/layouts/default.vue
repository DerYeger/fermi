<template>
	<UMain class="select-none">
		<UDashboardGroup>
			<UDashboardSidebar>
				<UNavigationMenu :items="sidebarItems" orientation="vertical" />
			</UDashboardSidebar>
			<UDashboardPanel>
				<template #header>
					<UDashboardNavbar :title="routeNames[route.name]">
						<template #right>
							<NewFermentButton />
						</template>
					</UDashboardNavbar>
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

	const routeNames: Record<typeof route["name"], string> = {
		index: "Dashboard",
		ferments: "Ferments",
		"ferment-id": "Ferment Details",
		archive: "Archive",
		settings: "Settings"
	};
</script>
