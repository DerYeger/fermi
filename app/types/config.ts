export const FermiConfigSchema = z.object({
	dataDir: z.string().optional(),
	maxBackups: z.number().min(1).max(20).default(3)
});

export type FermiConfig = zInfer<typeof FermiConfigSchema>;

export const FERMI_CONFIG_DEFAULTS: FermiConfig = {
	dataDir: undefined,
	maxBackups: 3
};

export const ChatConfigSchema = z.object({
	apiKey: z.string().optional(),
	modelId: z.string().default("xiaomi/mimo-v2-flash:free")
});

export type ChatConfig = zInfer<typeof ChatConfigSchema>;

export const AI_CONFIG_DEFAULTS: ChatConfig = {
	apiKey: undefined,
	modelId: "xiaomi/mimo-v2-flash:free"
};
