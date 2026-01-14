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
							v-if="part.type === 'text' && part.text.length > 0"
							:value="part.text"
							:cache-key="`${message.id}-${index}`"
							:parser-options="{ highlight: false }"
							class="*:first:mt-0 *:last:mb-0"
						/>
						<FermentSearchResults v-else-if="part.type === 'tool-fermentSearch'" :part="part as FermentSearchToolInvocation" />
					</template>
				</template>
				<UChatMessage v-else v-bind="message" :parts="message.parts.slice(0, 1)" :ui="{ container: 'pb-0' }" />
			</template>
		</UChatMessages>
	</div>

	<!-- Input -->
	<div class="border-t border-default p-4">
		<UChatPrompt v-model="input" :error="chat.error" @submit="onSubmit">
			<UChatPromptSubmit
				variant="subtle"
				:status="chat.status"
				@stop="chat.stop()"
				@reload="chat.regenerate()"
			/>
			<template v-if="fermentSelectItems.length > 0" #footer>
				<USelectMenu
					:model-value="selectedFerment?.id"
					:items="fermentSelectItems"
					placeholder="Select ferment for context..."
					variant="outline"
					class="w-full"
					value-key="id"
					leading-icon="hugeicons:vegetarian-food"
					@update:model-value="onFermentSelect"
				/>
			</template>
		</UChatPrompt>
	</div>
</template>

<script setup lang="ts">
	import FermentSearchResults from "~/components/Tools/FermentSearchResults.vue";

	const { chatId } = defineProps<{
		chatId: string
	}>();

	const { data: ferments } = useFerments();
	const {
		selectFerment,
		clearSelection,
		selectedFerment
	} = useChatFermentContext();

	const { chat, input, onSubmit } = useChat(() => chatId);

	const isChatTouched = defineModel<boolean>("isChatTouched", { required: true, default: false });

	watch(() => chat.value.lastMessage !== undefined, (hasMessage) => {
		isChatTouched.value = hasMessage;
	}, { immediate: true });

	const fermentSelectItems = computed(() => {
		return [
			{ id: undefined, label: "None" },
			...ferments.value.map((ferment) =>
				({
					id: ferment.id,
					label: `${ferment.name} (${formatDate(ferment.startDate)})`
				})).sort((a, b) => a.label.localeCompare(b.label))
		];
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
