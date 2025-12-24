<template>
	<div class="min-h-screen bg-(--ui-bg)">
		<header class="sticky top-0 z-50 border-b border-(--ui-border) bg-(--ui-bg)/80 backdrop-blur-sm">
			<div class="mx-auto max-w-5xl px-4 py-4">
				<div class="flex items-center justify-between">
					<NuxtLink to="/" class="flex items-center gap-2">
						<UIcon name="lucide:flask-conical" class="size-6 text-(--ui-primary)" />
						<span class="text-xl font-bold">Fermi</span>
					</NuxtLink>
					<div class="flex items-center gap-2">
						<NuxtLink to="/dashboard">
							<UButton variant="ghost" icon="lucide:bar-chart-3" size="sm" />
						</NuxtLink>
						<NuxtLink to="/settings">
							<UButton variant="ghost" icon="lucide:settings" size="sm" />
						</NuxtLink>
					</div>
				</div>
			</div>
		</header>

		<main class="mx-auto max-w-5xl px-4 py-6">
			<slot />
		</main>
	</div>
</template>
