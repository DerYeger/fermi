<template>
	<UMain class="select-none">
		<UDashboardGroup>
			<UDashboardSearch v-model="searchModel" :groups="searchGroups" />
			<UDashboardPanel :ui="{ body: 'sm:p-4' }">
				<template #header>
					<UDashboardToolbar>
						<template #left>
							<UNavigationMenu highlight :items="navigationItems" :ui="{ item: 'max-md:[&_span.truncate]:hidden' }" />
						</template>
						<template #right>
							<UDashboardSearchButton />
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
	import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from "@nuxt/ui";
	import { like, useLiveQuery } from "@tanstack/vue-db";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	const searchModel = ref("");

	const { data: ferments } = useLiveQuery((q) => {
		return q.from({ ferment: FermentCollection })
			.select(({ ferment }) => ({ id: ferment.id, name: ferment.name, state: ferment.state, startDate: ferment.startDate }))
			.where(({ ferment }) =>
				like(ferment.name, `%${searchModel.value}%`)
			)
			.orderBy(({ ferment }) => ferment.name, "desc");
	}, [searchModel]);

	const searchGroups = computed<CommandPaletteGroup<CommandPaletteItem>[]>(() => {
		const groups: CommandPaletteGroup<CommandPaletteItem>[] = [];
		const activeFermentItems: CommandPaletteItem[] = [];
		const completedFermentItems: CommandPaletteItem[] = [];

		ferments.value.forEach((ferment) => {
			const item: CommandPaletteItem = {
				type: "link",
				label: `${ferment.name} (${formatDate(ferment.startDate)})`,
				to: `/ferments/${ferment.id}`
			};
			if (ferment.state === "active") {
				activeFermentItems.push(item);
			} else {
				completedFermentItems.push(item);
			}
		});

		if (activeFermentItems.length > 0) {
			groups.push({
				id: "active-ferments",
				label: "Active Ferments",
				items: activeFermentItems
			});
		}
		if (completedFermentItems.length > 0) {
			groups.push({
				id: "completed-ferments",
				label: "Completed Ferments",
				items: completedFermentItems
			});
		}
		return groups;
	});

	const navigationItems = [
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
		{ type: "link", label: "Archive", icon: "lucide:archive", to: "/ferments/archive" },
		{ type: "link", icon: "lucide:settings-2", to: "/settings" }
	] as const satisfies NavigationMenuItem[];

	defineShortcuts({
		meta_1: () => {
			navigateTo(navigationItems[0].to);
		},
		meta_2: () => {
			navigateTo(navigationItems[1].to);
		},
		meta_3: () => {
			navigateTo(navigationItems[2].to);
		},
		meta_4: () => {
			navigateTo(navigationItems[3].to);
		}
	});
</script>
