import type { Tool, UIToolInvocation } from "ai";
import { Stream } from "@yeger/streams/sync";

const FermentSearchToolResultSchema = z.object({
	id: z.string(),
	name: z.string(),
	state: z.enum(["active", "completed", "failed"]),
	startDate: z.iso.date(),
	endDate: z.iso.date().nullable()
});
export type FermentSearchToolResult = zInfer<typeof FermentSearchToolResultSchema>;

const FERMENT_RESULT_LIMIT = 10;

const FermentQuerySchema = z.object({
	name: z.string().optional().describe("Filter by ferment name (partial match, case-insensitive)"),
	container: z.string().optional().describe("Filter by container name (partial match, case-insensitive)"),
	state: z.enum(["active", "completed", "failed"]).optional().describe("Filter by ferment state/status"),
	ingredientName: z.string().optional().describe("Filter by ingredient name (partial match, case-insensitive)"),
	startDateFrom: z.iso.date().optional().describe("Filter ferments started on or after this date (YYYY-MM-DD)"),
	startDateTo: z.iso.date().optional().describe("Filter ferments started on or before this date (YYYY-MM-DD)"),
	endDateFrom: z.iso.date().optional().describe("Filter ferments ended on or after this date (YYYY-MM-DD)"),
	endDateTo: z.iso.date().optional().describe("Filter ferments ended on or before this date (YYYY-MM-DD)")
});

const fermentSearch: Tool = {
	type: "function",
	description: "Search the user's ferment collection using various filters. Returns up to 10 relevant ferments with basic info (no notes/images). All filters are optional and combined with AND logic.",
	inputSchema: FermentQuerySchema,
	execute: async ({ name, container, state, ingredientName, startDateFrom, startDateTo, endDateFrom, endDateTo }: zInfer<typeof FermentQuerySchema>) => {
		let matches = Stream.from(FermentCollection.toArray);
		if (name) {
			const nameLower = name.toLowerCase();
			matches = matches.filter((f) => f.name.toLowerCase().includes(nameLower));
		}

		if (container) {
			const containerLower = container.toLowerCase();
			matches = matches.filter((f) => f.container?.toLowerCase().includes(containerLower) ?? false);
		}

		if (state) {
			matches = matches.filter((f) => f.state === state);
		}

		if (ingredientName) {
			const ingredientLower = ingredientName.toLowerCase();
			matches = matches.filter((f) =>
				f.ingredients.some((i) => i.name.toLowerCase().includes(ingredientLower))
			);
		}

		if (startDateFrom) {
			matches = matches.filter((f) => f.startDate >= startDateFrom);
		}

		if (startDateTo) {
			matches = matches.filter((f) => f.startDate <= startDateTo);
		}

		if (endDateFrom) {
			matches = matches.filter((f) => f.endDate !== null && f.endDate >= endDateFrom);
		}

		if (endDateTo) {
			matches = matches.filter((f) => f.endDate !== null && f.endDate <= endDateTo);
		}

		const allMatches = matches.toArray();
		const results = allMatches
			.slice(0, FERMENT_RESULT_LIMIT)
			.map((ferment) => FermentSearchToolResultSchema.parse(ferment));

		return { ferments: results, total: allMatches.length };
	}
};

export type FermentSearchToolInvocation = UIToolInvocation<typeof fermentSearch>;

export const chatTools = {
	fermentSearch
};
