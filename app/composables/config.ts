import type { FermiConfig } from "~/types/config";
import { FERMI_CONFIG_DEFAULTS, FermiConfigSchema } from "~/types/config";

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
