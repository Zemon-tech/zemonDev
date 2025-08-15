### Settings: Collaboration & Social — Roles & Permissions Plan

Goal: Implement a robust, scalable Roles & Permissions section under the Collaboration & Social tab on the Settings page that shows the current user's membership and role across all approved parent channels.

---

### Scope
- Show, for each parent channel the user is approved in, the user's effective role within that channel (admin, moderator, member).
- Reuse existing data sources and hooks where possible.
- Use DaisyUI for UI components; do not alter unrelated UI.
- No backend changes unless discovered blockers appear.

---

### Existing Building Blocks (to reuse)
- `SettingsPage` → `CollaborationSection` placeholder exists and is the insertion point.
- Channel membership statuses: `ApiService.getUserChannelStatuses(getToken)` and `useWorkspaceSettings()` which already shapes them into `channelMemberships`.
- Channel directory (for parent/child relation): `ApiService.getChannels(getToken)` via `useArenaChannels()`; every channel has `parentChannelId`.
- User roles context: `useUserRole()` provides `channelRoles`, `getUserChannelRole(channelId)`, and global role information fetched from `/api/users/me/role`.
- Filtering logic reference: `frontend/src/components/admin/UserList.tsx` demonstrates how to intersect approved membership with parent channels.

---

### Data Model and Logic
- Parent channel: a channel where `parentChannelId` is empty or null.
- Approved membership: entries from `getUserChannelStatuses` (or `useWorkspaceSettings().channelMemberships`) with `status === 'approved'`.
- Effective role per approved parent channel:
  - If `useUserRole().channelRoles[channelId]` exists, use its `role`.
  - Otherwise, default to `member` (i.e., a non-admin/moderator approved user).

---

### UX Requirements
- Section title: “Roles & Permissions”.
- Content: DaisyUI card with a responsive DaisyUI table or list.
- Columns: Channel, Role, Status.
- Status badge: approved, pending, banned, kicked as DaisyUI badges (we will primarily show approved parent channels in the main list, but we will gracefully handle and label any other status if present).
- Empty state: DaisyUI card with neutral message if there are no approved parent channels.
- Loading state: skeleton rows or DaisyUI `loading` indicators.
- Error state: DaisyUI alert if data fetch fails.

---

### Phase 1 — Read-only integration wiring
1. In `CollaborationSection` (within `frontend/src/pages/SettingsPage.tsx`):
   - Import and use `useWorkspaceSettings()` to access `channelMemberships`, loading and error.
   - Import and use `useArenaChannels()` to get the channel catalog, flatten to `channelId -> channel` map.
   - Import and use `useUserRole()` to read `channelRoles` and `getUserChannelRole`.
2. Compute in-memory view model:
   - `allChannels = Object.values(channels).flat()`
   - `idToChannel = new Map(allChannels.map(c => [String(c._id), c]))`
   - `approvedParentMemberships = channelMemberships.filter(m => m.status === 'approved' && (!idToChannel.get(String(m.channelId))?.parentChannelId))`
   - For each item, derive `role = getUserChannelRole(String(m.channelId)) ?? 'member'`.
3. No UI yet; log the computed list to verify correctness.

Acceptance:
- No UI changes visible other than console logs.
- No runtime errors; types aligned.

---

### Phase 2 — DaisyUI UI component
1. Build a small presentational component `RolesAndPermissionsCard` under `frontend/src/components/settings/` to render:
   - Header with icon and title using DaisyUI card header conventions.
   - Table using DaisyUI `table` with columns “Channel”, “Role”, “Status”.
   - Use DaisyUI `badge` for status; map: approved → `badge-success`, pending → `badge-warning`, denied → `badge-error`, banned/kicked → `badge-error`.
   - Fallback empty state: DaisyUI card with a subtle message.
   - Loading state: 3–5 skeleton rows using `skeleton` classes.
   - Error state: DaisyUI `alert` with retry button to refetch membership and channels.
2. Replace the placeholder Roles & Permissions block in `CollaborationSection` to use this component, passing the computed view model and handlers.

Acceptance:
- Roles & Permissions card renders with DaisyUI styles.
- Shows rows for approved parent channels with correct roles.
- No layout regressions on the Settings page.

---

### Phase 3 — Edge cases and resilience
- If channels are not yet loaded but memberships are, show loading state until both are ready.
- If roles context is still loading, temporarily show role as `…` with a spinner and update when ready.
- If a channel is missing from the channels catalog (rare), skip or mark as unknown channel without blocking.
- Ensure computations are memoized to avoid re-renders.

Acceptance:
- No flicker or inconsistent states during concurrent loads.
- Graceful handling of partial data.

---

### Phase 4 — QA and regression checks
- Verify with test accounts:
  - User with approved membership in two parent channels, moderator role in one.
  - User with no memberships → empty state.
  - User with banned/kicked statuses (should not appear in main list; confirm behavior).
- Cross-check against `ArenaPage` and `NirvanaChannel` to ensure shared hooks continue to work.

Acceptance:
- No errors in console; core Arena/Admin views unchanged.

---

### Phase 5 — Performance and cleanup
- Memoize flattening and filtering with `useMemo`.
- Avoid duplicate fetches; rely on existing hooks’ caching.
- Remove console logs; keep concise error logs.

Acceptance:
- Rendering remains smooth; no excessive re-renders.

---

### Implementation Notes (exact reuse points)
- Use `useWorkspaceSettings()` to avoid re-implementing membership fetching.
- Use `useArenaChannels()` for `parentChannelId` access; mirrors `UserList` logic for parent-only filtering.
- Use `useUserRole()` for channel role resolution; defaults to `member` if no explicit channel role.
- UI strictly DaisyUI: `card`, `table`, `badge`, `alert`, `btn`, `skeleton`.

---

### Rollback plan
- Keep the placeholder component in a git-backed diff for quick revert.
- Changes isolated to `CollaborationSection` and a new leaf component; removal restores previous behavior.

---

### Out of scope (future)
- Manage invites and moderation tools (placeholders remain).
- Editing of roles/permissions.
- Showing child channel roles.


