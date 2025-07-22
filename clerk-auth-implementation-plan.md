# Zemon Admin Clerk Authentication Implementation Plan

This document outlines the step-by-step plan to integrate Clerk authentication into the `frontend-admin` and `backend-admin` applications, aligning with the existing implementation in the main `zemonDev` project.

## **Phase 1: Backend-Admin Setup**

### **1. Environment Configuration**

-   **Objective**: Add Clerk secret keys and other necessary environment variables to the `.env` file for the `backend-admin` application.
-   **File to Modify**: `backend-admin/.env`
-   **Variables to Add**:
    -   `CLERK_SECRET_KEY`: Obtain from your Clerk dashboard.
    -   `CLERK_ISSUER`: Obtain from your Clerk dashboard (e.g., `https://clerk.yourdomain.com`).
    -   `CORS_ORIGIN`: Set to the URL of the `frontend-admin` application (e.g., `http://localhost:5174`).

### **2. Middleware Implementation**

-   **Objective**: Create authentication middleware to validate Clerk JWTs and protect routes.
-   **File to Create**: `backend-admin/src/middleware/auth.middleware.ts`
-   **Implementation**:
    -   Use `ClerkExpressRequireAuth` from `@clerk/clerk-sdk-node` to validate the session.
    -   Create a `protect` middleware that first runs `ClerkExpressRequireAuth` and then fetches the user from the local database using the `clerkId` from `req.auth`.
    -   Implement `checkRole` middleware to verify user roles (`admin`, `moderator`) against the `UserRole` collection.

### **3. API Route Updates**

-   **Objective**: Secure API endpoints with the new authentication middleware.
-   **Files to Modify**: All route files in `backend-admin/src/api/`.
-   **Implementation**:
    -   Apply the `protect` middleware to all routes that require authentication.
    -   Apply the `checkRole` middleware to routes that require specific administrative privileges.
    -   Remove any existing password-based authentication logic from controllers.

### **4. Webhook Integration**

-   **Objective**: Handle user creation, updates, and deletions via Clerk webhooks.
-   **File to Create**: `backend-admin/src/api/webhook.routes.ts` and `backend-admin/src/controllers/webhook.controller.ts`
-   **Implementation**:
    -   Create a new route to handle incoming webhook events from Clerk.
    -   Implement a controller to process these events, such as creating a new user in the local database when a new user signs up in Clerk.

## **Phase 2: Frontend-Admin Setup**

### **1. Environment Configuration**

-   **Objective**: Add the Clerk publishable key to the `.env` file for the `frontend-admin` application.
-   **File to Modify**: `frontend-admin/.env`
-   **Variable to Add**:
    -   `VITE_CLERK_PUBLISHABLE_KEY`: Obtain from your Clerk dashboard.

### **2. Clerk Provider Integration**

-   **Objective**: Wrap the entire application with the `ClerkProvider` to enable authentication context.
-   **File to Modify**: `frontend-admin/src/main.tsx` or `frontend-admin/src/App.tsx`
-   **Implementation**:
    -   Import `ClerkProvider` from `@clerk/clerk-react`.
    -   Wrap the root `App` component with `ClerkProvider`, passing the publishable key.

### **3. Authentication Pages**

-   **Objective**: Replace existing sign-in/sign-up pages with Clerk's UI components.
-   **Files to Modify/Create**:
    -   `frontend-admin/src/pages/SignInPage.tsx`
    -   `frontend-admin/src/pages/SignUpPage.tsx`
-   **Implementation**:
    -   Use the `<SignIn>` and `<SignUp>` components from Clerk to handle user authentication.
    -   Redirect authenticated users to the admin dashboard.

### **4. Protected Routes**

-   **Objective**: Secure admin-specific routes to ensure only authenticated and authorized users can access them.
-   **File to Modify**: `frontend-admin/src/App.tsx`
-   **Implementation**:
    -   Use Clerk's `SignedIn` and `SignedOut` components to conditionally render routes.
    -   Create a `ProtectedAdminRoute` component that uses the `useUser` and `useAuth` hooks to check for `admin` or `moderator` roles from the user's session.

### **5. API Service Updates**

-   **Objective**: Include the Clerk JWT in all authenticated API requests.
-   **File to Modify**: `frontend-admin/src/services/api.service.ts`
-   **Implementation**:
    -   Use the `getToken` function from the `useAuth` hook to retrieve the JWT.
    -   Add an `Authorization` header with the Bearer token to all `fetch` requests.

### **6. User Context and UI**

-   **Objective**: Display user information and manage UI state based on authentication status.
-   **Files to Modify**:
    -   `frontend-admin/src/context/UserRoleContext.tsx`
    -   `frontend-admin/src/components/layout/Navbar.tsx`
-   **Implementation**:
    -   Update `UserRoleContext` to fetch the user's role from the backend using the authenticated user's token.
    -   Modify the `Navbar` to display a `UserButton` from Clerk for profile management and sign-out.

## **Phase 3: Testing and Validation**

### **1. Backend Testing**

-   **Objective**: Ensure all protected routes in `backend-admin` are correctly secured.
-   **Steps**:
    -   Use an API client (e.g., Postman) to test that endpoints without a valid JWT return a `401 Unauthorized` error.
    -   Test role-based access to ensure that only users with the correct roles can access restricted endpoints.

### **2. Frontend Testing**

-   **Objective**: Verify the end-to-end authentication flow in `frontend-admin`.
-   **Steps**:
    -   Test the sign-in and sign-up flows to ensure they correctly redirect to the dashboard.
    -   Verify that protected routes are inaccessible to unauthenticated users.
    -   Confirm that the `UserButton` and other UI elements correctly reflect the user's authentication state.

By following this detailed plan, we can systematically implement Clerk authentication across both the `backend-admin` and `frontend-admin` applications, ensuring a secure and consistent user experience. 