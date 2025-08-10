## Single-Instance Real-time Notifications via MongoDB Change Streams

### Objective
- Deliver real-time notifications to the Quild user frontend without introducing new infrastructure, using MongoDB Change Streams.
- Keep the solution simple and robust for a single user backend instance.
- Ensure zero behavior change in existing UI, APIs, and admin flows.

### Constraints and Non-Goals
- Only one user backend instance will run; no leader election is required.
- No schema or payload changes that could affect the frontend or admin.
- Do not change the existing event name (`notification_received`) or the REST APIs.
- Admin backend continues to insert notifications as before; no admin changes.

### Current Relevant Behavior
- Admin backend writes notifications to MongoDB.
- User backend has Socket.IO and already emits `notification_received` when it creates notifications itself.
- Frontend fetches notifications via REST and displays a dropdown; it also expects real-time events named `notification_received` with the existing minimal payload.

### High-Level Design
- Add a Change Streams watcher in the user backend that listens for new inserts in the notifications collection.
- When a new notification is inserted, emit an event to the appropriate user via the existing socket emission utilities.
- Persist a resume token so the watcher can resume after restarts without missing events.
- Gate the feature behind a runtime flag to allow safe rollout.

### Minimal Changes & Compatibility Guarantees
- Do not modify any React components, hooks, or REST endpoints.
- Do not change the notification document schema.
- Emit the same event name (`notification_received`) and the same fields as today to avoid UI regressions.
- No changes to admin services or APIs.

### Implementation Plan (No Code)
1. Configuration
   - Add a feature flag (for example, an environment variable) to enable/disable the Change Streams watcher at runtime.
   - Ensure MongoDB is running as a replica set (required for Change Streams).
   - Ensure the DB credentials used by the user backend include permission to open change streams.

2. Watcher Initialization
   - Initialize the watcher during user backend startup after the app and Socket.IO are ready.
   - If the feature flag is off, do not start the watcher.

3. Watch Scope and Filtering
   - Listen only to the notifications collection for new inserts.
   - Avoid listening to updates or deletes to keep the first iteration simple.
   - Keep the watch payload minimal to reduce overhead.

4. Emission Logic
   - For each new notification, route to the specific user using the existing user-targeted socket emission path.
   - Maintain the current event name and payload shape so the frontend behaves identically.

5. Resume Token Persistence
   - Store the latest processed resume token in a dedicated small collection (single document for the notifications stream).
   - On startup, if a token exists, resume from it; otherwise start from the current point-in-time.

6. Error Handling & Recovery
   - Implement retry with exponential backoff when the watcher encounters transient errors or disconnects.
   - If the stored resume token becomes invalid (for example, due to oplog rollover), drop the token and continue from the present to avoid blocking.
   - Log all watcher state transitions (started, stopped, resumed) for observability.

7. Health & Observability
   - Add structured logs that include whether the watcher is enabled, current status (watching/paused), and the time of the last event processed.
   - Optionally expose a lightweight internal status endpoint or metric counter to verify the watcher is active.

8. Performance & Safety
   - Keep the emitted data small; rely on existing REST endpoints for full notification lists.
   - Do not block the watcher on socket emission failures; if a send fails, log it and continue. The frontend will still fetch via REST.
   - Respect existing rate limits and caching; do not alter them.

9. Rollout Strategy
   - Deploy behind the feature flag disabled by default.
   - Enable in a staging environment, verify logs show events being processed and users receiving real-time notifications.
   - Enable in production during a low-traffic window; monitor logs for errors and confirm UI behavior remains unchanged.
   - Keep the flag for easy rollback: disable the flag to stop the watcher instantly without code changes.

10. Testing
   - Local manual test: start the user backend with the feature flag on, insert a notification via the admin or direct DB operation, and verify the frontend receives `notification_received` in real time.
   - Integration test: simulate insertions and validate that the emission function is called with the expected payload and that the resume token is updated.
   - Failure scenarios: restart the backend to confirm resume behavior; briefly disconnect Mongo to confirm automatic recovery; simulate an invalid token to confirm the watcher skips to present.

### Security Considerations
- Use least-privilege DB credentials (only the needed database and change stream capability).
- Do not expose any new public endpoints for this feature.

### Future-Proofing (Optional Enhancements)
- Add support for update events if the UI will display real-time changes to existing notifications.
- Introduce metrics time-series (emits per minute, processing lag) if/when centralized monitoring is available.
- If horizontal scaling is introduced later, add a leader election mechanism to ensure only one active watcher runs at a time.

### Outcome
- Users receive admin-created notifications in real time with no changes to UI code or payloads.
- The system remains simple, robust, and easily reversible via the feature flag.


