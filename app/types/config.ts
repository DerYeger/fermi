export const FermiConfigSchema = z.object({
	dataDir: z.string().optional(),
	maxBackups: z.number().min(1).max(20).default(3)
});

export type FermiConfig = zInfer<typeof FermiConfigSchema>;

export const FERMI_CONFIG_DEFAULTS: FermiConfig = {
	dataDir: undefined,
	maxBackups: 3
};
