## Real-time Notification Delivery (Admin → User Frontend)

### Objectives
- Ensure users see admin-originated notifications in real time without refreshing.
- Keep changes localized and non-breaking to existing UI and socket features.
- Provide a scalable foundation with clear event contracts and guardrails.

### Current State Summary
- Backend
  - Emits per-user events via `emitToUser(userId, event, payload)` to room `user:{userId}`.
  - Events already emitted:
    - `notification_received` (on create)
    - `notification_updated` (read updates)
    - `notification_archived` (archive)
    - `notification_deleted` (delete)
    - `all_notifications_read` (bulk read)
  - Change Streams also emit `notification_received` on inserts, which can duplicate the create event.
- Frontend
  - Global Socket.IO client exists (`frontend/src/context/SocketContext.tsx`).
  - Notifications UI (`NotificationDropdown`) relies on REST via `useNotifications`, no socket listeners yet.

### Event Contract (source of truth)
- `notification_received`
  - payload: `{ id, type, title, message, priority, data?, createdAt }`
- `notification_updated`
  - payload: `{ id, isRead, readAt }`
- `notification_archived`
  - payload: `{ id }`
- `notification_deleted`
  - payload: `{ id }`
- `all_notifications_read`
  - payload: `{ count }`

Note: `data` is optional metadata: `{ entityId?, entityType?, action?, metadata? }`.

### Phase 0: Event contract and duplication guard
1) Document the above events and payloads (this file is the baseline).
2) Dedupe strategy for `notification_received`:
   - Client: Maintain a `Set<string>` of seen notification ids for the session; ignore duplicates.
   - Server (optional): Prefer service-level emission and disable Change Streams emission via env flag to avoid double sends.
3) Reconnect behavior:
   - On socket `connect`/`reconnect`, call `refetch()` (REST) to reconcile any missed events and refresh counts.

### Phase 1: Frontend socket listeners (non-breaking)
Implementation target: `frontend/src/hooks/useNotifications.ts`

- Wire to global socket: import `useSocket()` from `frontend/src/context/SocketContext.tsx` and attach listeners inside an effect that cleans up on unmount.
- Handlers
  - `notification_received`:
    - If matches current filters, prepend to `notifications` state.
    - Dedupe by `id`. Trim list to current page size if needed.
    - Update `stats.unread` and `stats.total` accordingly.
  - `notification_updated`:
    - Locate by `id` and update `isRead`, `readAt` in local state.
    - Decrement `stats.unread` when appropriate.
  - `notification_archived`:
    - Mark item as `isArchived` in local state.
    - If current filters exclude archived, remove it from visible list.
    - Increment `stats.archived` if tracked; adjust totals as needed.
  - `notification_deleted`:
    - Remove from list by `id`.
    - Decrement `stats.total` and `stats.unread` if needed.
  - `all_notifications_read`:
    - Mark all local items as read; set `stats.unread = 0`.
- On `connect`/`reconnect`: invoke `refetch()` from the hook to fully sync notifications and stats.
- Keep the hook’s public API unchanged so components like `NotificationDropdown` continue to work without edits.

### Phase 2: UX enhancements (optional but recommended)
- Toast/snackbar for `notification_received` with inline "Mark as read" action; dedupe by id to avoid double toasts.
- Subtle bell badge animation when new notifications arrive.
- Respect active filters in `NotificationDropdown`; for items not matching, update counts only.

### Phase 3: Stability and performance
- Debounce/batch state updates when multiple events arrive within ~100–300ms.
- Normalize local state: maintain a map (by id) and a separate ordered list to enable O(1) updates and reduce re-renders.
- Pagination guard: maintain max list size equal to current `limit`; drop oldest when prepending new items.
- Event application queue: if a `refetch()` is in-flight, queue socket events and apply after the fetch resolves to avoid race conditions.

### Phase 4: Edge cases, QA, telemetry
- Timezone consistency for `createdAt` across REST and socket payloads.
- Admin flows validation:
  - `POST /api/notifications/custom` (single user); confirm correct target `userId` from admin UI.
  - `POST /api/notifications/bulk` (all users) emitting `notification_received` for each recipient.
- Tests
  - Unit-test the reducer/handlers inside `useNotifications` for each event type, including dedupe logic and filter interactions.
- Telemetry
  - Add development-only console breadcrumbs for event receive and state updates; disabled in production builds.

### Backend considerations (no breaking changes)
- Per-user room join already in place in `backend/src/services/socket.service.ts` (`socket.join(\`user:${userId}\`)`).
- If using Change Streams emission alongside service emission, keep client-side dedupe enabled or add an env flag to disable one of the sources.
- Confirm CORS/socket origins set via `CORS_ORIGIN` and frontend envs (`VITE_BACKEND_URL`, `VITE_API_BASE_URL`).

### Rollout and safeguards
- Introduce a feature flag (env or build-time) to enable/disable socket-driven updates while keeping REST as fallback.
- Monitor error logs for listener leaks or double-handling; ensure proper `socket.off(...)` cleanup on unmount.

### Acceptance criteria
- When admin sends bulk/custom notifications:
  - Users see the bell badge update immediately.
  - New notification appears at the top of the list without refresh (if it matches active filters).
- Actions in one tab/session reflect in others in real-time:
  - Mark single notification as read → `notification_updated` updates other views.
  - Mark all as read → `all_notifications_read` updates counts and list.
  - Archive/delete → list and counts update across views.
- No duplicate notification entries when both service and change-stream emits are present (client-side dedupe works).
- No regressions in chat or other socket-powered features.

### Minimal implementation outline (Phase 1)
1) `useNotifications`:
   - Import `useSocket` and attach listeners for all five events.
   - Maintain a `seenIds` `Set<string>`; ignore duplicate `notification_received` by id.
   - Update local `notifications` and `stats` in-place; refetch on `connect`/`reconnect`.
   - Cleanup: remove listeners on unmount.
2) Keep REST fetches as-is; sockets optimistically patch the UI between server fetches.

This plan is additive, localized, and designed to avoid breaking existing UI/flows while enabling real-time notification updates.


