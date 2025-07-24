# Ban/Kick Functionality Implementation Plan (Backend & Frontend)

## Overview
This plan outlines a robust, scalable, and modular approach to implementing the ban and kick functionality for Arena channels, referencing `userChannelStatus.model.ts`. The plan covers both backend and frontend changes, including admin actions, user experience, and automatic status updates.

---

## Phase 1: Requirements Analysis & Data Flow Design
- **Clarify requirements** with stakeholders (user) for any ambiguities.
- **Map out data flow** for ban/kick actions:
  - How parent/child channel relationships are determined
  - How user membership is checked
  - How status updates propagate to child channels
- **Define API endpoints** for ban/kick actions (admin/mod only)
- **Define API endpoints** for checking user status when accessing a channel
- **Document all required fields/updates in `userChannelStatus.model.ts`**

---

## Phase 2: Backend Implementation - Ban/Kick Actions
- **Implement API endpoint** for banning/kicking a user from a parent channel:
  - Accepts: userId, parentChannelId, duration (days or 'kick'), reason, adminId
  - Updates `userChannelStatus` for parent and all child channels:
    - Sets `isBanned` or `isKicked`, `banExpiresAt`, `banReason`, `bannedBy`, `kickedAt`, `kickedBy`, `status`
- **Implement logic** to fetch all child channels for a given parent
- **Ensure atomic updates** for all affected documents (parent + children)
- **Add audit logging** for ban/kick actions (optional but recommended)

---

## Phase 3: Backend Implementation - Status Checks & Auto-Unban
- **Implement API/middleware** to check user status when accessing a channel:
  - If `isBanned` or `isKicked`, return appropriate error/message and ban expiry time
- **Implement scheduled job** (e.g., cron) to auto-update status from 'banned' to 'approved' when `banExpiresAt` is reached
- **Ensure status consistency** across parent and child channels

---

## Phase 4: Frontend Integration
- **Update BanModal** to fetch and display only parent channels the user is currently joined in
- **Fetch and display current admin/mod username** in the modal
- **On confirm ban/kick:**
  - Call backend API with userId, parentChannelId, duration, reason, adminId
  - Show success/error feedback
- **When a banned/kicked user tries to access a channel:**
  - Fetch user status for that channel
  - Show appropriate message (ban/kick reason, expiry, etc.)

---

## Phase 5: Testing & Edge Cases
- **Test all flows:**
  - Ban/kick from parent propagates to children
  - Ban/kick messages shown correctly
  - Auto-unban works as expected
- **Handle edge cases:**
  - User already banned/kicked
  - User rejoins after ban expires
  - Admin tries to ban/kick from a channel user is not in
- **Document all API contracts and data flows**

---

## Phase 6: Review & Handoff
- **Review implementation with stakeholders**
- **Incorporate feedback and finalize**
- **Prepare for deployment and monitoring**

---

## Notes
- All updates to `userChannelStatus.model.ts` must be atomic and consistent
- Parent/child channel relationships must be clearly defined and queryable
- All user-facing messages should be clear and actionable
- If any requirement is unclear, pause and clarify with the user before proceeding

---

## Important Changes Log

### Phase 1
- Documented how parent/child channel relationships are modeled in ArenaChannel (using parentChannelId).
- Defined queries to fetch all parent channels and all child channels for a given parent.
- Outlined how to check which parent channels a user is joined in using UserChannelStatus and ArenaChannel.
- Specified that status updates (ban/kick) must propagate from parent to all child channels by updating UserChannelStatus for each.
- Drafted API endpoints for ban/kick actions and user status checks.
- Listed all required fields/updates in userChannelStatus.model.ts for ban, kick, and unban actions.

### Phase 2
- Added POST /api/arena/channels/:parentChannelId/ban endpoint for admin/mods.
- Implemented banOrKickUserFromParentChannel controller to update UserChannelStatus for parent and all child channels.
- Endpoint supports both temporary bans (with expiry) and permanent kicks.
- All updates are performed atomically using a MongoDB transaction.
- Returns affected channel IDs in the response for traceability.
- Fixed type errors in userChannelStatus model and controller for status and nullable fields.

### Phase 3
- Backend now enforces status checks for bans/kicks when a user accesses a channel (messages endpoint returns appropriate error and info).
- Added an auto-unban script (backend/src/scripts/auto-unban-expired-users.ts) to update expired bans to approved status.

### Phase 4
- Begin frontend integration:
  - Update BanModal to show only parent channels the user is currently joined in.
  - Fetch and display current admin/mod username in the modal.
  - On confirm ban/kick, call backend API and show feedback.
  - Show appropriate message to banned/kicked users when accessing a channel. 