<template>
	<UMain class="select-none">
		<UDashboardGroup unit="rem">
			<UDashboardSearch v-model="searchModel" :groups="searchGroups" />
			<UDashboardPanel :ui="{ body: 'sm:p-4' }">
				<template #header>
					<UDashboardToolbar>
						<template #left>
							<UNavigationMenu highlight :items="navigationItems" :ui="{ item: isChatOpen ? 'max-xl:[&_span.truncate]:hidden' : 'max-md:[&_span.truncate]:hidden' }" />
						</template>
						<template #right>
							<ChatButton v-model="isChatOpen" />
							<UDashboardSearchButton class="max-sm:hidden" />
							<NewFermentButton with-shortcut />
						</template>
					</UDashboardToolbar>
				</template>
				<template #body>
					<slot />
				</template>
			</UDashboardPanel>
			<template v-if="isLargeScreen">
				<UDashboardSidebar
					v-if="isChatOpen"
					:open="false"
					side="right"
					:default-size="25"
					:ui="{ body: 'p-0 sm:px-0', header: 'hidden' }"
				>
					<ChatSidebar @close="isChatOpen = false" />
				</UDashboardSidebar>
			</template>
			<UDashboardSidebar
				v-else
				v-model:open="isChatOpen"
				:ui="{ body: 'p-0 sm:px-0', header: 'hidden' }"
			>
				<ChatSidebar @close="isChatOpen = false" />
			</UDashboardSidebar>
		</UDashboardGroup>
	</UMain>
</template>

<script setup lang="ts">
	import type { CommandPaletteGroup, CommandPaletteItem, NavigationMenuItem } from "@nuxt/ui";
	import { like, useLiveQuery } from "@tanstack/vue-db";
	import NewFermentButton from "~/components/Forms/NewFermentForm/NewFermentButton.vue";

	useBadgeCount();

	const searchModel = ref("");

	const isChatOpen = ref(false);

	const isLargeScreen = useMediaQuery("(min-width: 1024px)");

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
			icon: "hugeicons:home-07",
			to: "/"
		},
		{
			type: "link",
			label: "Ferments",
			icon: "hugeicons:vegetarian-food",
			to: "/ferments"
		},
		{ type: "link", label: "Archive", icon: "hugeicons:archive-03", to: "/ferments/archive" },
		{ type: "link", icon: "hugeicons:settings-05", to: "/settings" }
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
