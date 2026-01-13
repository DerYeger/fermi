## Plan: Persisted Chat History + Sidebar UI

Persist chats in `localStorage` by introducing a small “chat history store” composable that owns `activeChatId`, chat metadata (title/timestamps), and per-chat message arrays. Update `useChat` to hydrate messages from that store when constructing the AI chat instance, and to persist messages back (preferably on a debounced hook like `onFinish`). Extend the sidebar with a popover that lists past chats, lets users switch, create a new chat, and delete chats; default to the last used chat unless a new one is created.

### Steps
1. Create `useChatHistory()` in [app/composables/chatHistory.ts](app/composables/chatHistory.ts) using `useLocalStorage` and zod parsing/migration.
2. Update `useChat` in [app/composables/chat.ts](app/composables/chat.ts) to accept `chatId`, restore saved `messages`, and persist updates via `onFinish`/debounce.
3. Change [app/components/Chat.vue](app/components/Chat.vue) to use stored `activeChatId` by default, and only generate a new ID when the user clicks “New chat”.
4. Extend [app/components/ChatSidebar.vue](app/components/ChatSidebar.vue) with a `UPopover` history picker: select chat, delete chat, and “New chat”.
5. Add automatic title generation in `useChatHistory()` (e.g., first user text trimmed + truncated) and update `updatedAt` on each assistant completion.

### Further Considerations
1. Title strategy: heuristic (fast/offline) now vs optional AI-generated titles later.
2. Storage limits: cap max chats/messages and/or truncate old content to avoid localStorage overflow.
3. Message fidelity: store full AI SDK message parts vs only `{role, content}` for smaller footprint.
