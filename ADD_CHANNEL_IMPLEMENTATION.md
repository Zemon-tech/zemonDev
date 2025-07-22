# Plan: Add Channel Modal & Functionality

This document outlines the plan to implement the "Add Channel" feature in the `frontend-admin` and `backend-admin` applications. The feature will be implemented via a full-page modal form with complex conditional logic.

---

## Phase 1: Backend API Enhancements — Important Changes
- Enhanced `getUsers` in `backend-admin/src/controllers/user.controller.ts` to support an optional `role` query parameter for filtering users by role (e.g., moderators).
- Added `createChannel` controller in `backend-admin/src/controllers/arenaChannel.controller.ts` to handle channel creation, with validation and secure population of the `createdBy` field.
- Registered a new `POST /api/channels` route in `backend-admin/src/api/arenaChannel.routes.ts`, protected by authentication middleware.

---

## Phase 2: Frontend UI - Modal and Form Component — Important Changes
- Created a reusable `FullScreenModal` component in `frontend-admin/src/components/common/FullScreenModal.tsx` for full-page modals, using DaisyUI.
- Created a modern, space-efficient `AddChannelForm` component in `frontend-admin/src/components/channels/AddChannelForm.tsx` with all required fields and a two-column layout, using DaisyUI.
- Both components are ready for data integration and conditional logic in the next phase.

---

## **Phase 2: Frontend UI - Modal and Form Component (`frontend-admin`)**

This phase focuses on building the visual components for the feature.

1.  **Create `FullScreenModal` Component**:
    *   **File**: `frontend-admin/src/components/common/FullScreenModal.tsx`
    *   **Action**: Create a new, reusable full-page modal component.
    *   **Props**: It will accept `isOpen`, `onClose`, and `title` props. It will handle the modal overlay and the container layout, with a close button in the corner.

2.  **Create `AddChannelForm` Component**:
    *   **File**: `frontend-admin/src/components/channels/AddChannelForm.tsx`
    *   **Action**: Create the dedicated component for the new channel form.
    *   **Layout**: The form will be designed to use the available space effectively, with a two-column layout for fields where appropriate (e.g., placing "Active" and "Permissions" checkboxes side-by-side). All components will be from DaisyUI.
    *   **Fields**:
        *   `Channel Name` (text input)
        *   `Group` (select)
        *   `Type` (select)
        *   `Parent Channel` (select)
        *   `Description` (textarea)
        *   `Active` (checkbox)
        *   `Permissions` (two checkboxes: `canRead`, `canMessage`)
        *   `Moderators` (multi-select, will require a custom component or a library compatible with DaisyUI)

---

## **Phase 3: Frontend Logic & Data Integration (`frontend-admin`)**

This phase wires up the new UI components with data and the backend API.

1.  **Manage Modal State**:
    *   **File**: `frontend-admin/src/pages/ChannelsPage.tsx`
    *   **Action**:
        *   Add state to manage the visibility of the "Add Channel" modal.
        *   Connect the "Add Channel" button to toggle this state.
        *   Render the `FullScreenModal` and the `AddChannelForm` inside it, passing the necessary props (`isOpen`, `onClose`, etc.).

2.  **Fetch Form Data Dependencies**:
    *   **File**: `frontend-admin/src/components/channels/AddChannelForm.tsx`
    *   **Action**: Inside the form component, use the `useEffect` hook. When the component mounts (i.e., when the modal opens), it will make two API calls:
        *   Fetch the list of moderators: `GET /api/users?role=moderator`.
        *   Fetch all channels: `GET /api/channels`. This list will be filtered on the frontend to find potential parent channels (where `parentChannelId` is `null`).
    *   Populate the "Moderators" and "Parent Channel" dropdowns with the fetched data.

3.  **Implement Conditional Form Logic**:
    *   **File**: `frontend-admin/src/components/channels/AddChannelForm.tsx`
    *   **Action**: Use `useState` and `useEffect` to implement the required conditional logic:
        *   **Parent Channel -> Type**: When the "Parent Channel" dropdown is changed to a specific value indicating "This is a Parent", set the `type` state to `'announcement'` and disable the `type` dropdown.
        *   **Type -> Permissions**: When the `type` state changes to `'announcement'` or `'showcase'`, set the `canMessage` checkbox state to `false` and disable it.
        *   **UI Feedback**: Render the small helper text messages below the relevant fields when this logic is active.

4.  **Handle Form Submission**:
    *   **File**: `frontend-admin/src/components/channels/AddChannelForm.tsx`
    *   **Action**:
        *   Implement an `onSubmit` handler for the form.
        *   This handler will call the `POST /api/channels` endpoint using the `useApi` hook, sending the current form state as the payload.
        *   Manage loading and error states specifically for the submission process (e.g., disabling the submit button, showing an error alert).
        *   On successful submission, call the `onClose` prop and trigger a refresh of the channel list on the main `ChannelsPage`.

---

## Phase 3: Frontend Logic & Data Integration — Important Changes
- Integrated modal state and form rendering in `ChannelsPage.tsx`.
- `AddChannelForm` now fetches moderators and parent channels on mount, and uses Clerk's `useUser()` to set and display the current user as the creator.
- All conditional logic for parent/type and type/permissions is implemented, with UI feedback.
- Form submission is fully functional, with loading and error states, and closes the modal on success.
- All UI uses DaisyUI components and is robust and scalable.

---

## **Phase 4: Final Verification**

1.  **Testing**:
    *   Manually test the entire user flow from clicking "Add Channel" to seeing the new channel appear in the list.
    *   Verify all conditional logic works as expected.
    *   Test form validation and error handling.
    *   Confirm that the `createdBy` field is correctly and automatically populated on the backend.
2.  **Cleanup**:
    *   Review code for clarity and remove any console logs or temporary code.
    *   Ensure the UI is responsive and looks good on different screen sizes. 