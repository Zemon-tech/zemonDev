
# Project Zemon: Detailed Overview

This document provides a detailed overview of the Zemon project, including its architecture, technology stack, user flow, and data flow.

## 1. Project Vision

Zemon is a platform designed to help software engineers practice and improve their problem-solving and system design skills. It provides a "Crucible" for tackling complex problems and a "Forge" for accessing curated learning resources. The platform aims to provide a structured environment for deliberate practice.

## 2. Technology Stack

### Backend
- **Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk
- **Real-time**: (Not yet implemented, but planned)
- **Validation**: Zod (inferred from common practice)
- **Environment Variables**: `dotenv`

### Frontend
- **Framework**: React.js with Vite
- **Language**: TypeScript
- **Routing**: React Router
- **Styling**: Tailwind CSS with daisyUI component library
- **State Management**: React Context API (`WorkspaceContext`)
- **Text Editor**: Tiptap
- **API Communication**: `fetch` API wrappers in `lib/`
- **Authentication**: Clerk React SDK

## 3. Application Architecture

Zemon uses a standard client-server architecture.

-   **Backend**: A monolithic Express.js application that serves a RESTful API. It handles business logic, database interactions, and authentication.
-   **Frontend**: A single-page application (SPA) built with React. It communicates with the backend API to fetch and display data, and provides a rich, interactive user experience.

## 4. User Flow

The user journey begins with authentication and centers around the Crucible and Forge.

### 4.1. Authentication
- **Sign Up/Sign In**: Users can create an account or sign in using Clerk. The frontend uses `SignInPage.tsx` and `SignUpPage.tsx`. Upon successful authentication, Clerk issues a JWT.
- **Protected Routes**: The frontend application is wrapped in a `ClerkProvider`. Most pages are protected and require a signed-in user. The user's username is used in the URL structure (e.g., `/:username/dashboard`).

### 4.2. Dashboard (`DashboardPage.tsx`)
After logging in, the user is redirected to their dashboard. This page provides an overview of their progress and quick links to other parts of the application. (This page is currently a placeholder).

### 4.3. The Forge (`ForgePage.tsx`)
The Forge is a curated library of learning resources.
- **Browsing**: Users can browse a list of resources like articles, videos, and documentation. These are fetched from the `/api/forge` backend endpoint.
- **Filtering & Searching**: Users can filter resources by type and search by keywords.
- **Viewing**: Clicking on a resource either opens it in a new tab (if it's an external link) or navigates to a details page (`ForgeDetailPage.tsx`) for more information.

### 4.4. The Crucible (`CruciblePage.tsx` & `CrucibleProblemPage.tsx`)
This is the core feature of the application, where users solve problems.

**Step 1: Problem Selection (`CruciblePage.tsx`)**
1.  The user navigates to the `/crucible` page.
2.  The frontend fetches a list of available problems from the `/api/crucible/problems` endpoint.
3.  Problems are displayed in a grid of `ProblemCard` components.
4.  The user can search for problems and filter them by tags.
5.  The user selects a problem by clicking on its card.

**Step 2: The Workspace (`CrucibleProblemPage.tsx`)**
1.  After selecting a problem, the user is navigated to `/crucible/problem/:id`.
2.  This page loads the `CrucibleWorkspaceView.tsx` component, which is the main user interface for problem-solving.
3.  The workspace fetches the full problem details, any existing solution draft the user has, and any notes they've taken for this problem.

**The Workspace UI (`CrucibleWorkspaceView.tsx`) consists of:**
-   **Problem Details Sidebar**: On the left, this sidebar (`ProblemDetailsSidebar.tsx`) displays the problem's title, description, requirements, constraints, etc. It can be toggled.
-   **Main Content Area**: This is the central part of the view.
    -   **Workspace Mode Selector**: Users can switch between two modes:
        -   **Solution Editor (`SolutionEditor.tsx`)**: A rich text editor (Tiptap) where the user writes their solution. The content is auto-saved as a draft every few seconds to the `/api/crucible/drafts` endpoint.
        -   **Notes Collector (`NotesCollector.tsx`)**: Another editor instance for taking private notes. This is also auto-saved.
-   **AI Chat Sidebar**: On the right, the `AIChatSidebar.tsx` provides an interface to chat with an AI assistant. The chat context is aware of the problem and the user's current solution draft. It communicates with the `/api/ai` backend endpoints.

## 5. Data Flow

### Backend Data Flow
1.  **Request**: An HTTP request comes into the Express server.
2.  **Middleware**: The request passes through middleware for authentication (`auth.middleware.ts`), rate limiting, and error handling. The Clerk middleware verifies the JWT from the `Authorization` header.
3.  **Routing**: The request is directed to the appropriate router (e.g., `crucible.routes.ts`).
4.  **Controller**: The route calls a controller function (e.g., `crucible.controller.ts`).
5.  **Logic**: The controller handles the business logic, interacting with Mongoose models to perform CRUD operations on the MongoDB database.
6.  **Response**: The controller sends a JSON response back to the client using a standardized `ApiResponse` format.

### Frontend Data Flow
1.  **Page Load**: A user navigates to a page. The React Router renders the corresponding page component from the `/pages` directory.
2.  **Data Fetching**:
    -   Inside a page component (e.g., `CruciblePage.tsx`), a `useEffect` hook triggers an API call.
    -   API call functions are defined in `/lib/*.ts` (e.g., `getProblems` in `crucibleApi.ts`). These functions use the browser's `fetch` API.
    -   For authenticated requests, the `getToken()` hook from Clerk is used to get the JWT, which is added to the `Authorization` header.
3.  **State Management**:
    -   Fetched data is stored in the component's state using `useState`.
    -   For cross-component state, React's Context API is used. `WorkspaceProvider` (`lib/WorkspaceContext.tsx`) shares state related to the Crucible workspace, such as the active editor mode (solution or notes).
4.  **Rendering**: React renders the UI based on the current state.
5.  **User Interaction & Data Update**:
    -   User actions (e.g., typing in the `SolutionEditor`) trigger event handlers.
    -   These handlers update the component's state (`setSolutionContent`).
    -   A `useEffect` hook, listening to changes in the state, triggers auto-save API calls (`updateDraft`) to persist the changes to the backend.

