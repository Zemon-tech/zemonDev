## Notification System — Issues, Discrepancies, and Risks

This document summarizes problems found across the Quild notification system spanning `backend`, `frontend`, `backend-admin`, and `frontend-admin`. It lists security gaps, schema/API mismatches, real-time delivery gaps, caching pitfalls, and robustness concerns that can break or degrade the notification experience.

### Security and Access Control
- **Missing admin checks on user backend admin endpoints**: The user backend exposes endpoints labeled as admin without enforcing role checks.
  - `backend/src/api/notification.routes.ts`: `POST /notifications/custom` and `POST /notifications/bulk` are registered with only `protect` and a limiter, no admin role guard. Any authenticated user could create notifications, including bulk to all users.
  - Impact: Privilege escalation, mass-notification spam.

- **Ambiguous admin semantics in user backend**: The controller for "admin only" creation uses the requesting user as the target.
  - `backend/src/controllers/notification.controller.ts` → `createCustomNotification` sets `userId` to `req.user._id` and does not accept a target `userId`.
  - Impact: API contract drift vs docs; suggests these endpoints are not true admin endpoints but are presented as such.

### Schema and API Mismatches (Admin vs User)
✅ **Field naming mismatch: `data` vs `metadata`**
  - User backend model uses `data` (with nested `metadata` field inside) for extra payload: `backend/src/models/notification.model.ts`.
  - Admin backend uses top-level `metadata`: `backend-admin/src/models/notification.model.ts` and services/controllers always write `metadata`.
  - Impact: If both services write to the same MongoDB collection, documents created by admin may not expose fields the user backend/UI expects (`data`), and vice versa. The current user UI mostly renders `title/message/type/priority`, so deep-links or payload-driven behaviors will break.

✅ **Type mismatch: `system`**
  - Admin supports `type: 'system'` (admin model, services, UI) while user backend/service/type unions do not consistently include `system`.
    - Admin: `backend-admin/src/models/notification.model.ts` enum includes `'system'`.
    - User: `backend/src/models/notification.model.ts` and service/type unions omit `'system'`.
  - Impact: Admin-created `system` notifications will exist in DB but are not recognized consistently by user code/types. UI filtering in user app won’t offer `system` and TS unions diverge from stored data.

- **TTL policy inconsistency**
  - User backend applies a TTL index on `createdAt` (30 days) and also has a simple (non-TTL) index on `expiresAt`.
    - `backend/src/models/notification.model.ts` adds `createdAt` TTL via `expireAfterSeconds: 30d`.
  - Admin backend attaches TTL to `expiresAt` with `{ expireAfterSeconds: 0 }` (per-doc expiration) and no `createdAt` TTL.
    - `backend-admin/src/models/notification.model.ts`.
  - Impact: Conflicting deletion behavior across services if sharing the same collection. Items may disappear earlier than intended (due to `createdAt` TTL), or may never expire (if relying on `expiresAt` but it’s unset in user-created docs).

- **Index definition divergence**
  - Admin model attempts to pass an `indexes` array inside Schema options; this is not a standard Mongoose option and may be ignored. Both services then add indexes programmatically but with different sets.
  - Impact: Indexes may differ between services; at startup both may attempt to build different index sets on the same collection. This can cause performance variability and potential index build churn.

### Real-time Delivery Gaps
- **No real-time bridge from admin writes to user sockets**
  - Admin create/bulk endpoints in `backend-admin` only insert into MongoDB; they do not emit real-time events to users (and are a separate service/process from user backend’s Socket.IO server).
  - Impact: Users do not receive real-time notifications for admin-created items; they only see them on next fetch.

- **User frontend does not listen to notification events**
  - The user backend emits `notification_received`, `notification_updated`, `notification_archived`, `notification_deleted`, `all_notifications_read` via `emitToUser` in `backend/src/services/notification.service.ts`.
  - The user frontend has a socket client (`frontend/src/services/socket.service.ts`) but no listeners in notifications UI/hooks for these events.
  - Impact: Even for user-backend-originated events, the UI won’t update live; badges and lists stay stale until manual refresh.

### Caching and Consistency
- **Stale cache for notifications and stats**
  - `backend/src/api/notification.routes.ts` uses `cacheMiddleware` on `GET /api/notifications` and `/stats`.
  - There is no cache invalidation on writes (mark read, mark-all, archive, delete, create, bulk). `cache.middleware.ts` provides `clearCache()` but services/controllers do not call it.
  - Impact: Users will see stale lists and unread counts for up to the cache TTL.

### Robustness and Scalability
- **Bulk fanout loads all users in memory**
  - User backend `createBulkNotifications` fetches all users, filters, then `insertMany`; admin backend follows similar approach.
  - Impact: Memory/DB pressure for large user bases; no batching/retries/backoff; no job queue. Emits are synchronous in user service.

- **No idempotency for admin create/bulk**
  - Replays or client retries can duplicate notifications; no idempotency keys or dedupe logic.

- **Race conditions around index builds**
  - Two services may attempt index builds with different definitions on the same collection on startup.

### API and Contract Drift
- **Docs vs implementation mismatch**
  - Several READMEs/MDs claim routes or parity that don’t exist or differ. Example: user backend docs mention preferences endpoints but controller stubs only return defaults and don’t persist.
  - Impact: Client expectations may not match server behavior; future implementers can assume features that aren’t there.

- **Response shape differences**
  - Admin APIs often return `{ success, data: {...} }`; user frontend helper `handleResponse()` unwraps `data.data || data`, but any deviation can break typed consumers.

### TypeScript/Model Mismatches
- **Frontend user `Notification` type omits `'system'`**
  - `frontend/src/lib/notificationApi.ts` does not include `'system'` in `Notification['type']` union.
  - Impact: TS friction and UI filtering gaps for admin-created system notifications.

- **Different payload field names across apps**
  - User FE expects `data` payload; admin FE uses `metadata`. If a single UI needs to read both, it must normalize.

### Operational and Config Risks
- **Cross-service environment coupling**
  - If `backend-admin` and `backend` point to the same MongoDB database/collection, all schema/TTL/index discrepancies apply. If they point to different DBs, users won’t see admin-created notifications at all.

- **Socket auth token shape**
  - The client sends `auth: { token: 'Bearer <jwt>' }`; server auth middleware must accept the `Bearer` prefix. Misconfiguration will silently prevent rooms from joining and thus receiving emits.

### Concrete Breakage Scenarios
- A non-admin logged-in user calls `POST /api/notifications/bulk` on user backend and spams all users (missing role check).
- Admin creates `type: 'system'` notifications; user app never shows `system` in filters, and TS unions don’t reflect it.
- Admin creates notifications with only `metadata`; user-side code expecting `data` cannot deep-link/open related entities.
- User marks notifications as read; badge and list remain stale due to Redis cache, causing user confusion.
- Admin relies on `expiresAt` TTL; user model’s `createdAt` TTL deletes earlier than intended.
- Large bulk send OOMs or spikes DB due to fetching all users at once and inserting without batching.

### Recommendations (brief)
- Enforce admin role checks on user backend admin endpoints (`checkRole(['admin'])`).
- Unify schema: choose `data` or `metadata`; support both during migration; add `system` type to user backend unions and UI.
- Adopt a single TTL policy (either global createdAt TTL or per-item expiresAt TTL), document and enforce.
- Add cache invalidation on write ops for keys matching `api:<userId>:/api/notifications*` and `/stats`.
- Bridge admin writes to user real-time: either call a lightweight emit endpoint in user backend after inserts or use MongoDB change streams in user backend to emit on inserts/updates regardless of writer.
- Add socket listeners in `frontend` to update notifications state on `notification_*` events.
- Implement bulk fanout via a queue (BullMQ), with batching/backoff/retries and metrics; avoid all-in-memory user lists.
- Add idempotency keys to admin create/bulk to prevent duplicates on retries.


