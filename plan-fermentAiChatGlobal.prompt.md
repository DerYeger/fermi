## Plan: Ferment AI Chat Sidebar (Global, Frontend + LocalStorage)

Add a collapsible, global right-side chat sidebar (available throughout the app), gated by (a) online connectivity and (b) a user-provided OpenRouter API key stored in localStorage for now (temporary, not secure). The chat UI uses Nuxt UI components and `@ai-sdk/vue` for message state; requests to [OpenRouter](https://openrouter.ai/) are made from the frontend. The settings page stores the key and only shows a masked value after successful save (first 4 chars + mask).

Safeguards/system prompt should make it explicit that the assistant is only for fermentation topics. If no ferment is selected, the assistant answers about fermentation in general. Users can select a ferment from the UI; only then should that ferment’s data (JSON) be included in the context for the *next* message.

By default, expect users to be on OpenRouter’s free tier and pick a free-available model as the default (with an option to change later).

### Steps 1–6
1. Implement a global right-side sidebar container (e.g., mounted in [app/layouts/default.vue](app/layouts/default.vue)) with open/close toggle and responsive behavior.
2. Add an “OpenRouter” section to [app/pages/settings.vue](app/pages/settings.vue) with input + Save/Delete; after save, show a masked key using only the first 4 chars.
3. Extend config storage to include non-sensitive AI settings (and temporarily the API key): update [app/types/config.ts](app/types/config.ts) + [app/composables/config.ts](app/composables/config.ts) to store `openRouterApiKey` and/or `openRouterKeyPrefix` and optionally model selection.
4. Create composables:
	- `useOpenRouterKey` backed by localStorage config: `setKey`, `getKey`, `deleteKey`, `getMasked`, and `canUseAiChat` (online + key present).
	- `useChatFermentContext` (or similar) that manages “selected ferment for next message” state and exposes `selectFerment(id)`, `clearSelection()`, and `consumeSelectionForNextSend()`.
5. Implement the chat sidebar component using Nuxt UI + `@ai-sdk/vue`:
	- Add a ferment selector UI (search/select) that lets the user pick a ferment to attach to the *next* message.
	- Build a strict system prompt (“fermentation-only assistant”) + user message.
	- If a ferment was selected for the next message, include its JSON (from [app/types/ferment.ts](app/types/ferment.ts)) in that request’s context; otherwise do not include any ferment data.
	- Call OpenRouter via `fetch` when `canUseAiChat` is true.
6. Add targeted tests for: gating logic (offline/no key), ferment selection/consume behavior, and message send flow (mock fetch).

### Further Considerations 1–3
1. CORS risk: if OpenRouter blocks browser/webview origins, consider a fallback (e.g., Tauri HTTP plugin or a proxy) later.
2. Security: localStorage is temporary; migrate to keyring/secure storage when the plugin choice is finalized.
3. Context size/privacy: include ferment JSON only when explicitly selected; consider trimming large fields and truncating notes to prevent overly large prompts.
