## Changelog: Real-time Notifications

### Phase 1 (Socket listeners in useNotifications)
- Added real-time socket listeners in `frontend/src/hooks/useNotifications.ts`:
  - `notification_received`: prepend new items, dedupe by id, update stats, trim to page limit.
  - `notification_updated`: update `isRead`/`readAt` locally; refresh stats.
  - `notification_archived`: mark as archived; refetch when filters may hide the item; refresh stats.
  - `notification_deleted`: remove from list; refresh stats.
  - `all_notifications_read`: mark all local items read; set unread to 0.
- Added reconnect handling to refetch notifications and stats on socket `connect`.
- Introduced session-level deduplication using a `Set` to prevent duplicates from multi-source emits.

Impact:
- UI updates live in `NotificationDropdown` and the bell badge without breaking existing REST-based flows.
- No changes required to other components or backend APIs.

### Backend bootstrap fix (enables cross-backend emits via Change Streams)
- Updated `backend/src/index.ts` to initialize Change Streams only after a successful MongoDB connection, resolving: "MongoDB connection not established. Skipping Change Streams initialization."
- This allows the user backend to watch the `Notification` collection and emit `notification_received` when the admin backend inserts notifications into the same MongoDB database.
- Environment requirement: set `ENABLE_CHANGE_STREAMS=true` on the user backend; MongoDB must be a replica set (Atlas OK).

### Change Streams resume token fix
- Updated `backend/src/services/changeStreams.service.ts` to store MongoDB Change Streams resume tokens as `Schema.Types.Mixed` instead of `String`.
- Fixes CastError for `token` when persisting resume token objects (with `_data` field).


