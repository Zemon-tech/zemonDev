# Plan: Admin Dashboard - Channels Page Implementation

This document outlines the plan to implement the Channels management page in the `frontend-admin` application. The page will display Arena channels grouped by their category, show their parent-child relationships, and provide administrative actions.

## Phase 1: Backend API Development (`backend-admin`)

The first step is to create an API endpoint that provides the necessary channel data to the frontend.

1.  **Create Controller**:
    *   Create a new file: `backend-admin/src/controllers/arenaChannel.controller.ts`.
    *   Implement a `getChannels` function that retrieves all documents from the `ArenaChannel` model.
    *   The function will handle potential errors and send the list of channels as a JSON response.

2.  **Create Route**:
    *   Create a new file: `backend-admin/src/api/arenaChannel.routes.ts`.
    *   Define a `GET /api/channels` route that maps to the `getChannels` controller function.
    *   Ensure the route is protected and only accessible by authenticated admin users.

3.  **Register Routes**:
    *   Update `backend-admin/src/index.ts` to import and use the new `arenaChannelRoutes`.

## Phase 2: Frontend Data Handling (`frontend-admin`)

With the backend ready, the frontend can be updated to fetch and manage the channel data.

1.  **Data Fetching in `ChannelsPage.tsx`**:
    *   In `frontend-admin/src/pages/ChannelsPage.tsx`, use the `useEffect` hook to fetch data from the `/api/channels` endpoint upon component mount.
    *   Utilize the existing `useApi` custom hook for the API call.
    *   Implement and manage loading and error states to provide user feedback.

2.  **Data Processing and Structuring**:
    *   Create a utility function to process the flat list of channels received from the API.
    *   This function will:
        *   Group channels by their `group` property ('getting-started', 'community', 'hackathons').
        *   Within each group, structure the channels into a parent-child hierarchy. Parent channels (where `parentChannelId` is `null`) will have a `children` array containing their respective child channels.
    *   Store this structured data in the component's state.

## Phase 3: UI Component Development (`frontend-admin`)

This phase focuses on building the reusable UI components to display the data according to the requirements.

1.  **Create Reusable `ChannelTable` Component**:
    *   Create a new component file: `frontend-admin/src/components/channels/ChannelTable.tsx`.
    *   This component will accept `title` (string) and `channels` (the processed list for one group) as props.
    *   It will use the DaisyUI `table` component for the layout.

2.  **Implement Table Rows**:
    *   The component will iterate through the `channels` prop.
    *   For each parent channel, it will render a `<tr>`. This row will be visually highlighted (e.g., with a different background color or bold text) to distinguish it as a parent.
    *   Immediately after the parent row, it will iterate through the parent's `children` array and render a `<tr>` for each child channel.
    *   Child channel rows will have a visual indentation in the "Name" column to indicate their subordinate status (e.g., using `pl-8`).

3.  **Implement Table Columns**:
    *   **Name**: Display the `name`.
    *   **Type**: Display the `type`.
    *   **Active**: Display a "Yes" or "No" string based on the `isActive` boolean.
    *   **Permissions**:
        *   Conditionally render a DaisyUI `badge` with the text "Message" if `permissions.canMessage` is `true`.
        *   Conditionally render a DaisyUI `badge` with the text "Read" if `permissions.canRead` is `true`.
    *   **Updated At**:
        *   Create a helper function to format the `updatedAt` ISO string.
        *   The function will output the date as `dd/mm/yy` and time as `hh:mm am/pm`.
        *   Display the formatted date and time in two separate lines within the same table cell.
    *   **Actions**:
        *   Add two DaisyUI `btn` components: "Edit" and "Delete".
        *   These will be placeholders for now, with their functionality to be implemented in a future step.

## Phase 4: Final Integration (`frontend-admin`)

The final phase involves integrating the new components and logic into the main `ChannelsPage`.

1.  **Update `ChannelsPage.tsx`**:
    *   Import the `ChannelTable` component.
    *   After the data has been fetched and processed, render three instances of the `ChannelTable` component.
    *   Pass the corresponding title and processed data for each group ('Getting Started', 'Community', 'Hackathons') to each `ChannelTable`.
    *   Ensure the page correctly displays loading spinners or error messages as needed. 