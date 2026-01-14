import type { ChatConfig, FermiConfig } from "~/types/config";
import { AI_CONFIG_DEFAULTS, ChatConfigSchema, FERMI_CONFIG_DEFAULTS, FermiConfigSchema } from "~/types/config";

export const useFermiConfig = createGlobalState(() => {
	const storedConfig = useLocalStorage<FermiConfig>("fermiConfig", FERMI_CONFIG_DEFAULTS);

	const parsedConfig = computed(() => FermiConfigSchema.parse(storedConfig.value));

	const maxBackups = computed<number>({
		get: () => parsedConfig.value.maxBackups,
		set: (value: number) => {
			storedConfig.value.maxBackups = value;
		}
	});

	const dataDir = computed<string | undefined>({
		get: () => parsedConfig.value.dataDir,
		set: (value: string | undefined) => {
			storedConfig.value.dataDir = value;
		}
	});

	return {
		maxBackups,
		dataDir
	};
});

const MASK_CHAR = "•";
const UNMASKED_LENGTH = 4;
const MASK_LENGTH = 20;

export const useChatConfig = createGlobalState(() => {
	const storedConfig = useLocalStorage<ChatConfig>("fermiChatConfig", AI_CONFIG_DEFAULTS);

	const parsedConfig = computed(() => ChatConfigSchema.parse(storedConfig.value));

	const apiKey = computed<string | undefined>({
		get: () => parsedConfig.value.apiKey,
		set: (value: string | undefined) => {
			storedConfig.value.apiKey = value;
		}
	});

	const maskedApiKey = computed<string | undefined>(() => {
		const key = apiKey.value;
		if (!key || key.length < UNMASKED_LENGTH) {
			return undefined;
		}
		return key.slice(0, UNMASKED_LENGTH) + MASK_CHAR.repeat(MASK_LENGTH);
	});

	const modelId = computed<string>({
		get: () => parsedConfig.value.modelId,
		set: (value: string) => {
			storedConfig.value.modelId = value;
		}
	});

	const isOnline = useOnline();
	const hasApiKey = computed(() => !!apiKey.value);

	const isChatAvailable = computed(() => {
		return isOnline.value && hasApiKey.value;
	});

	return {
		apiKey,
		maskedApiKey,
		modelId,
		isOnline,
		hasApiKey,
		isChatAvailable
	};
});
