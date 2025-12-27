import { SchemaValidationError } from "@tanstack/vue-db";

export function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj)) as T;
}

export function getErrorMessage(error: unknown): string {
	if (error instanceof SchemaValidationError) {
		return z.prettifyError(error);
	}
	return String(error);
}
