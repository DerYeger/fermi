import type { z } from "zod";

export function useLocalStorageSchema<T extends z.ZodType>(
	key: string,
	schema: T,
	defaultValue: z.infer<T>
) {
	return useLocalStorage<z.infer<T>>(key, defaultValue, {
		serializer: {
			write: (value) => JSON.stringify(value),
			read: (raw) => {
				const parsed = schema.safeParse(JSON.parse(raw));
				if (parsed.success) {
					return parsed.data;
				}
				return defaultValue;
			}
		}
	});
}
