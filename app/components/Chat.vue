<template>
	<!-- Messages -->
	<div class="flex-1 overflow-y-auto p-4">
		<div v-if="chat.messages.length === 0" class="flex h-full flex-col gap-4 items-center justify-center text-center">
			<UIcon name="hugeicons:ai-chat-02" class="mb-4 size-12 opacity-50" />
			<p class="text-sm">
				Ask me anything about fermentation or select a ferment to get specific advice.
			</p>
			<p class="mt-8 text-xs text-muted">
				AI may produce incorrect or misleading information.
				Always verify critical advice.
				Your messages will be sent to your chosen AI provider for processing.
				Images and notes are not used for context.
			</p>
		</div>

		<UChatMessages
			:messages="chat.messages"
			:status="chat.status"
			should-auto-scroll
		>
			<template #content="{ message }">
				<template v-if="message.role === 'assistant'">
					<template v-for="(part, index) in message.parts" :key="`${message.id}-${part.type}-${index}${'state' in part ? `-${part.state}` : ''}`">
						<MDCCached
							v-if="part.type === 'text'"
							:value="part.text"
							:cache-key="`${message.id}-${index}`"
							:parser-options="{ highlight: false }"
							class="*:first:mt-0 *:last:mb-0"
						/>
					</template>
				</template>
				<UChatMessage v-else v-bind="message" :parts="message.parts.slice(0, 1)" :ui="{ container: 'pb-0' }" />
			</template>
			<template #indicator>
				<UButton
					class="px-0"
					color="neutral"
					variant="link"
					loading
					label="Thinking..."
				/>
			</template>
		</UChatMessages>
	</div>

	<!-- Ferment Selector -->
	<div v-if="ferments.length > 0" class="border-t border-default px-4 py-2 relative">
		<UFieldGroup class="w-full">
			<USelectMenu
				:model-value="selectedFermentIdForSelector"
				:items="fermentSelectItems"
				placeholder="Select ferment for context..."
				class="w-full"
				:ui="{ base: 'w-full' }"
				value-key="id"
				clear
				@update:model-value="onFermentSelect"
			>
				<template #leading>
					<UIcon name="hugeicons:vegetarian-food" class="size-4" />
				</template>
			</USelectMenu>
			<UButton
				v-if="hasSelection"
				icon="hugeicons:cancel-01"
				variant="subtle"
				color="error"
				@click="clearSelection"
			/>
		</UFieldGroup>
		<p v-if="hasSelection" class="mt-1 text-xs text-muted">
			Context will be included in your next message.
		</p>
	</div>

	<!-- Input -->
	<div class="border-t border-default p-4">
		<UChatPrompt v-model="input" :error="chat.error" @submit="onSubmit">
			<UChatPromptSubmit :status="chat.status" @stop="chat.stop()" @reload="chat.regenerate()" />
		</UChatPrompt>
	</div>
</template>

<script setup lang="ts">
	const { data: ferments } = useFerments();
	const {
		selectFerment,
		clearSelection,
		hasSelection,
		selectedFerment
	} = useChatFermentContext();

	const { chat, input, onSubmit } = useChat(createId());

	const fermentSelectItems = computed(() => {
		return ferments.value.map((f) => ({ id: f.id, label: f.name }));
	});

	const selectedFermentIdForSelector = computed(() => {
		return selectedFerment.value?.id ?? "";
	});

	function onFermentSelect(id: string | undefined) {
		if (!id) {
			clearSelection();
			return;
		}
		const ferment = ferments.value.find((f) => f.id === id);
		if (ferment) {
			selectFerment(ferment);
		}
	}
</script>
