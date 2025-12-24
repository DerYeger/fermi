export interface Ingredient {
	id: string
	name: string
	amount: string
	unit: string
}

export interface Ferment {
	id: string
	name: string
	ingredients: Ingredient[]
	saltRatio: number
	notes: string
	imagePath?: string
	imageBase64?: string
	startDate: string
	endDate?: string
	rating?: number
	completionNotes?: string
	isArchived: boolean
	createdAt: string
	updatedAt: string
}

export interface FermentationData {
	ferments: Ferment[]
	settings: AppSettings
}

export interface AppSettings {
	saveLocation: string
	maxBackups: number
}

export const defaultSettings: AppSettings = {
	saveLocation: "",
	maxBackups: 5
};

export const createEmptyFerment = (): Omit<Ferment, "id" | "createdAt" | "updatedAt"> => ({
	name: "",
	ingredients: [],
	saltRatio: 2,
	notes: "",
	startDate: new Date().toISOString().split("T")[0] as string,
	isArchived: false
});

export const generateId = (): string => {
	return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};
