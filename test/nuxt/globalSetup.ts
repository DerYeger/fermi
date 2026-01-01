export function setup() {
	const originalStdoutWrite = process.stdout.write.bind(process.stdout);
	const originalStderrWrite = process.stderr.write.bind(process.stderr);

	process.stdout.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		if (text.includes("<Suspense>")) {
			// Suppress mountSuspended warnings
			return;
		}
		return originalStdoutWrite(chunk, ...args as any);
	}) as typeof process.stdout.write;

	process.stderr.write = ((chunk: string | Uint8Array, ...args: unknown[]) => {
		const text = typeof chunk === "string" ? chunk : chunk.toString();
		if (text.includes("transformMode")) {
			// Suppress Nuxt environment warning
			return;
		}
		return originalStderrWrite(chunk, ...args as any);
	}) as typeof process.stderr.write;
}
