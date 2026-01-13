import { Chat } from "@ai-sdk/vue";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { DirectChatTransport, ToolLoopAgent } from "ai";
import { getErrorMessage } from "~/types/utils";

export function useChat(chatId: MaybeRefOrGetter<string>) {
	const { apiKey, modelId } = useChatConfig();
	const { getChat, saveChat } = useChatHistory();
	const toast = useToast();

	const chat = computed(() => {
		const openrouter = createOpenRouter({
			apiKey: apiKey.value
		});

		const agent = new ToolLoopAgent({
			model: openrouter.chat(modelId.value),
			instructions: "You are a helpful assistant that provides advice on fermentation based on user questions and the provided ferment context. Politely decline to answer questions that are not related to fermentation. Always be very concise and clear in your responses."
		});

		const transport = new DirectChatTransport({ agent, generateMessageId: createId });

		const initialMessages = getChat(toValue(chatId))?.messages;

		return new Chat({
			id: toValue(chatId),
			transport,
			messages: initialMessages,
			onError(error) {
				toast.add({
					description: getErrorMessage(error)
				});
			},
			onFinish() {
				// Persist after completion
				saveChat(toValue(chatId), chat.value.messages);
			}
		});
	});

	const input = ref("");

	const { isChatAvailable } = useChatConfig();
	const { getSelectionContext } = useChatFermentContext();

	async function onSubmit() {
		const text = input.value.trim();
		const canChatSendMessage = chat.value.status === "ready" || chat.value.status === "error";
		if (!text || !canChatSendMessage || !isChatAvailable.value) return;
		input.value = "";

		const fermentContext = getSelectionContext();

		chat.value.sendMessage({
			id: createId(),
			role: "user",
			parts: [
				{ type: "text", text },
				{ type: "text", text: `today's date is ${getISODate()}` },
				...(fermentContext ? [{ type: "text" as const, text: JSON.stringify(fermentContext, null, 2) }] : [])
			]
		});
	}

	return {
		input,
		chat,
		onSubmit
	};
}
