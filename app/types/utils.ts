import type { FermentImage } from "~/types/ferment";
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

const percentageFormat = new Intl.NumberFormat(undefined, {
	style: "percent",
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});
export function formatPercentage(value: number): string {
	return percentageFormat.format(value);
}

export function sortImages(images: FermentImage[]): FermentImage[] {
	return images.toSorted((a, b) => a.date.localeCompare(b.date));
}
