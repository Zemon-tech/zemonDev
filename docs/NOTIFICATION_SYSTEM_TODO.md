# Notification System Improvements (Todo)

This document lists updates and additions to unify admin/user notification flows and make the system robust and scalable across `backend`, `frontend`, `backend-admin`, and `frontend-admin`.

## Phase 1 — Correctness and UX (Foundational)

- Align schema across services
  - Unify payload field naming: pick `data` or `metadata` and support the other for backward compatibility in serializers.
  - Add `system` type to `backend` model to match `backend-admin`.
  - Decide and standardize TTL policy: either global 30-day `createdAt` TTL or per-item `expiresAt` TTL; document and enforce one approach.
- Real-time delivery end-to-end
  - Frontend: listen for `notification_received`, `notification_updated`, `notification_archived`, `notification_deleted`, `all_notifications_read` via `socket.service.ts` and update UI state (list + badge) without refresh.
  - Quick bridge for admin-created notifications: after `backend-admin` writes, call a small internal endpoint in `backend` to emit to affected user(s). Alternate: enable MongoDB change streams in `backend` to emit on inserts/updates from any writer.
- API parity and access controls
  - `backend`: protect POST `/notifications/custom` and `/notifications/bulk` with admin role checks (consistent with `backend-admin`).
  - Implement `/notifications/preferences` GET/PUT in `backend` (present in summary but missing), even if stubbed initially.
  - Optionally add `/notifications/cleanup` in `backend` to match docs.
- Cache correctness
  - Invalidate Redis caches on write ops (read/mark-all/arch/ delete/custom/bulk) for affected users. Provide helper(s) to clear keys matching `api:<userId>:/api/notifications*` and `/api/notifications/stats`.
- UI polish (frontend)
  - Recompute unread badge on socket events; optimistic updates on mark-read/archive/delete.

## Phase 2 — Scale and Reliability

- Bulk fanout via job queue
  - Use BullMQ (Redis) for `/bulk` notifications; enqueue user ID batches, process in workers with backoff/retries and metrics.
  - Fetch users in pages/streams (no full in-memory lists), insert in chunks (e.g., 1–5k per batch), and emit progressively.
- Socket.IO clustering readiness
  - Add Redis adapter to `backend` Socket.IO; configure sticky sessions in proxy; validate CORS/credentials.
- Emission reliability
  - Adopt an outbox pattern or transactional emit after DB commit; on worker success emit events; on reconnect, client triggers a refetch to cover missed events.
- Idempotency & safety
  - Add idempotency keys to admin bulk/create endpoints to avoid duplicate sends on retries.
- Index review & query hygiene
  - Ensure compound indexes cover common filters: `{ userId, createdAt }`, `{ userId, isRead, createdAt }`, `{ userId, type, createdAt }`, `{ userId, priority, createdAt }`.

## Phase 3 — Features and Policy

- Notification preferences (persistent)
  - Create a `NotificationPreference` model per user; include per-type toggles and delivery channels (in-app/email/push).
  - Enforce preferences in creators/bulk pipeline; exclude opted-out users before insert/emit.
- Templates and targeting
  - Reusable templates with variables and links; segment targeting (by role, activity, channel membership, etc.).
- Multichannel delivery
  - Add email (transactional provider) and Web Push; respect preferences and backoff policies.
- Admin UX upgrades (frontend-admin)
  - Live preview, dry-run counts, audience estimate, schedule sends, and progress/metrics view for bulk jobs.

## Phase 4 — Observability, Security, Testing

- Metrics & logging
  - Track created/sent/emitted counts, latency, failures; dashboards and alerts.
  - Structured logs with correlation IDs for bulk jobs and emits.
- Audit & rate limits
  - Audit log for admin actions (who sent what to whom), stricter limits on admin endpoints, CSRF protection on admin UI.
- Testing
  - Unit tests for service methods, integration tests for REST + socket emission, e2e covering admin-create → user-receive flow (including reconnect).

## Implementation Notes

- Change stream emitter (option)
  - In `backend`, watch `Notification` collection; on insert/update affecting `isRead`/`isArchived`, emit to `user:<userId>` appropriate events. Ensure resumable tokens and backpressure.
- Cache invalidation
  - Provide `clearUserNotificationCache(userId)` helper to clear keys like `api:${userId}:/api/notifications*` and `api:${userId}:/api/notifications/stats*`.
- Config & env
  - Ensure unified `VITE_API_BASE_URL` and `VITE_BACKEND_URL` across apps; align allowed CORS origins; configure Redis host for queue and Socket.IO adapter.
- Migration
  - If unifying `data`/`metadata` or adding `system` enum in `backend`, include a safe migration or dual-read strategy.

## Quick Wins (execute first)

1) Frontend: add socket listeners for notification events and trigger refetch/update state.
2) Backend: add admin guards to `/notifications/custom` and `/notifications/bulk`.
3) Backend: implement cache invalidation on write ops.
4) Bridge: call `backend` emit endpoint from `backend-admin` after save (until change streams/queue land).
5) Schema: add `system` type to `backend` model and document unified payload field.
