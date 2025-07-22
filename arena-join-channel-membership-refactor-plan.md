# Arena Channel Membership Refactor Plan

## **Overview**
This plan outlines a robust, scalable approach to refactor how channel membership is managed and displayed in the Arena platform. The new approach will:
- Remove API response overrides for per-user permissions in `/api/arena/channels`.
- Use the `UserChannelStatus` table as the single source of truth for channel membership.
- Ensure join requests, membership, and admin approval flows are clear, efficient, and production-ready.
- Use daisyUI components for all UI elements (tables, buttons, etc.).
- **Only channels with `isActive: true` will be fetched and shown to users in all relevant backend and frontend logic.**

---

## **Phase 1: Backend Model & API Refactor**

### 1.1. **Update Channel Fetching**
- `/api/arena/channels` returns all channels as stored in MongoDB **where `isActive: true`**, with their default/global `permissions` fields (no per-user override).
- Remove any logic that injects per-user `canRead`/`canMessage` into the channel list response.

### 1.2. **Membership Check Logic**
- All checks for whether a user is a member of a channel (for reading, posting, etc.) should use the presence of an `approved` `UserChannelStatus` document for that user and channel.
- Remove any code that infers membership from the channel's `permissions` fields.

### 1.3. **Join Request Handling**
- When a user requests to join a parent channel, create a `UserChannelStatus` document for the user and the parent channel **and** for all its child channels (status: `pending`). Only consider channels where `isActive: true`.
- Ensure this logic is atomic and idempotent (no duplicate requests).

### 1.4. **Admin Join Requests API**
- Create a production-ready endpoint to fetch all pending join requests, grouped by user, with the list of channels requested. Only include channels where `isActive: true`.
- Add endpoints to accept/reject individual channel requests and to accept/reject all requests for a user in one action.

---

## **Phase 2: Frontend User Experience Refactor**

### 2.1. **Nirvana Join Channel Card**
- Show all parent channels the user is **not** a member of (i.e., no `UserChannelStatus` document with `status: approved` for that user/channel) **and where `isActive: true`**.
- When the user requests to join, send a request for the parent channel (and all its children with `isActive: true`) as described above.
- Use daisyUI components for all UI (checkboxes, buttons, cards, etc.).

### 2.2. **Membership Checks in UI**
- All UI logic (show/hide channels, enable/disable posting, etc.) should check membership by querying the `UserChannelStatus` table, not by reading `canRead`/`canMessage` from the channel object. Only consider channels with `isActive: true`.

---

## **Phase 3: Admin Panel Refactor**

### 3.1. **Join Requests Table**
- In the admin panel, add a "Join Requests" tab or section.
- Display a table (using daisyUI `table` component) with the following columns:
  - **Username**
  - **Channel Name(s)**: For each channel, show accept/reject buttons (daisyUI `btn`)
  - **Actions**: Accept All / Reject All buttons for all requests from that user
- Each row represents a user with one or more pending join requests for channels where `isActive: true`.
- Accept/reject actions update the `UserChannelStatus` document(s) accordingly.

### 3.2. **Bulk Actions**
- Implement backend and frontend logic for bulk accept/reject (all channels for a user).
- Ensure UI updates in real time after actions.

---

## **Phase 4: Cleanup & Migration**

### 4.1. **Remove Legacy Logic**
- Remove all code that overrides channel permissions per user in the API response.
- Remove any frontend logic that infers membership from channel `permissions` fields.

### 4.2. **Testing & Validation**
- Add tests for all new endpoints and membership logic.
- Validate that all membership checks, join requests, and admin actions work as expected at scale, only for channels with `isActive: true`.

---

## **Notes & Open Questions**
- All UI components must use daisyUI as per project standards.
- If any ambiguity arises (e.g., how to handle subchannels with different permissions), clarify with the product owner before proceeding.
- No assumptions should be made beyond what is specified in this plan.

---

**Please review and approve this plan. Once approved, implementation will proceed phase by phase.** 

---

## **Implementation Change Log**

### Phase 1.1
- Updated the backend `getChannels` controller so that `/api/arena/channels` now returns only channels where `isActive: true`.
- Removed all logic that injected per-user `canRead`/`canMessage` overrides into the channel list response.
- Channels are now grouped and returned by category as stored in MongoDB, with their default/global permissions fields only. 

### Phase 1.2
- All backend membership checks for posting and joining channels now use `UserChannelStatus` (status: 'approved') to determine if a user is a member.
- All logic that used `channel.permissions` for user-specific membership or posting rights has been removed from controllers and socket event handlers. 

### Phase 1.3
- Added a new production endpoint: `POST /api/arena/channels/:channelId/join`.
- When called, this endpoint atomically and idempotently creates a `UserChannelStatus` (status: 'pending') for the parent channel and all its active child channels for the current user (if not already present).
- Returns a list of affected channel IDs in the response. 

### Phase 1.4
- Added admin endpoints for join request management:
  - `GET /api/arena/channels/join-requests`: Fetch all pending join requests, grouped by user, with channel names (only isActive: true channels).
  - `POST /api/arena/channels/join-requests/:userId/:channelId/accept`: Accept a single join request.
  - `POST /api/arena/channels/join-requests/:userId/:channelId/reject`: Reject a single join request.
  - `POST /api/arena/channels/join-requests/:userId/accept-all`: Accept all pending requests for a user.
  - `POST /api/arena/channels/join-requests/:userId/reject-all`: Reject all pending requests for a user.
- All endpoints require admin or moderator role and only include channels where `isActive: true`. 

### Phase 2.1
- Refactored the Nirvana join channel card to:
  - Only show parent channels the user is not a member of (using UserChannelStatus, not channel.permissions).
  - Use the new join endpoint for join requests.
  - Use daisyUI components for all UI (checkboxes, buttons, cards, etc.).
  - Remove all logic that infers membership from channel.permissions.
  - Fetch UserChannelStatus for the current user and use it to filter joinable channels. 

### Phase 2.2
- All UI membership checks (show/hide channels, enable/disable posting, etc.) now use `UserChannelStatus` (status: 'approved'), not channel.permissions.
- Only channels with `isActive: true` are considered for membership and UI logic. 

### Phase 3
- Added a "Join Requests" tab to the admin panel in the Arena page.
- Displays a daisyUI table of pending join requests, grouped by user, with per-channel accept/reject buttons and bulk Accept All/Reject All actions.
- All actions use the new backend endpoints and update the UI in real time. 