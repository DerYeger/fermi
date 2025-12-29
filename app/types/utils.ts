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

export function limitLength(str: string, maxLength: number): string {
	if (str.length <= maxLength) {
		return str;
	}
	return `${str.slice(0, maxLength - 3)}...`;
}

export function formatPercentage(value: number): string {
	const rounded = Math.round(value * 1000) / 10;
	return `${rounded}%`;
}
