# Plan: Edit Channel Functionality (Admin)

This document outlines a robust, scalable plan to implement the edit channel feature in the admin Channels page, using a dedicated edit modal and form component.

---

## Component Design: Separate Edit Modal & Form

- A new `EditChannelForm` and `EditChannelModal` will be created for editing channels.
- This avoids complex conditional logic and keeps the add and edit flows cleanly separated.
- The edit form will be pre-filled with the selected channel's data and will only allow editing of permitted fields.
- The UI/UX will remain consistent with the add flow by using similar DaisyUI components and layout.

---

## Phase 1: Backend API Enhancements

1. **Add Update Channel Endpoint**
   - In `backend-admin/src/controllers/arenaChannel.controller.ts`, implement an `updateChannel` controller that:
     - Accepts a channel ID as a route parameter and updated fields in the request body.
     - Validates and updates the channel in the database.
     - Returns the updated channel or an error.
   - In `backend-admin/src/api/arenaChannel.routes.ts`, add a `PUT /channels/:id` route, protected by authentication middleware.

---

## Phase 1: Backend API Enhancements — Important Changes
- Added an `updateChannel` controller in `backend-admin/src/controllers/arenaChannel.controller.ts` for updating channels by ID.
- Registered a new `PUT /api/channels/:id` route in `backend-admin/src/api/arenaChannel.routes.ts`, protected by authentication middleware.

---

## Phase 2: Frontend UI & Modal Integration

1. **Edit Modal State Management**
   - In `ChannelsPage.tsx`, add state to track the channel being edited and modal visibility.
   - When the edit button is clicked, open the modal and pass the selected channel's data.

2. **Create EditChannelForm and EditChannelModal**
   - Implement a new `EditChannelForm` component for editing channels.
   - Implement a new `EditChannelModal` (using `FullScreenModal` for layout) to wrap the form.
   - The form will be pre-filled with the selected channel's data and will only allow editing of permitted fields.
   - On submit, call the update API and refresh the channel list.

---

## Phase 3: Data Flow & State Management

1. **API Call for Update**
   - On form submit in edit mode, call `PUT /api/channels/:id` with the updated data.
   - On success, close the modal and refresh the channel list.
   - On error, show an error alert.

2. **Optimistic UI & Error Handling**
   - Show loading indicators and disable the submit button while updating.
   - Handle and display any API errors.

---

## Phase 4: Final Verification

1. **Testing**
   - Test editing both parent and child channels.
   - Test validation, error handling, and UI/UX for accessibility and responsiveness.

2. **Code Cleanup**
   - Remove any temporary code or logs.
   - Ensure all DaisyUI components are used for consistency.

---

## Approval
- No code changes will be made until you approve this plan.
- Once approved, I will proceed phase by phase, confirming each step as needed. 