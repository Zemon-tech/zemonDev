## Crucible Analysis Flow Optimization Plan

This document outlines a phased plan to optimize and fix issues in the Crucible analysis flow, focusing on creating a more robust, scalable, and user-friendly experience.

### Phase 1: Foundational Backend Changes (COMPLETED)

**Objective:**
- Allow multiple solution drafts (active and archived) for the same user and problem.
- Ensure the backend correctly handles draft creation, archiving, and reattempts.

**Changes Made:**
1.  **`solutionDraft.model.ts`**:
    - Removed the unique compound index on `{ userId: 1, problemId: 1 }`.
    - Added non-unique indexes on `{ userId: 1, problemId: 1, status: 1 }` and `{ userId: 1, problemId: 1 }`.
2.  **`solutionDraft.controller.ts`**:
    - `getDraft`: Modified to only fetch drafts with `status: 'active'`.
    - `updateDraft`: Uses `findOneAndUpdate` with `upsert: true` to create or update an *active* draft.
    - `reattemptDraft`: Explicitly archives any existing active draft before creating a new one.
3.  **`crucible.controller.ts`**:
    - `analyzeUserSolution`: Archives the active draft *before* creating the analysis.
4.  **Database Migration**:
    - Created and ran a migration script (`fix-solution-draft-indexes.ts`) to apply the index changes to the live database.

**Benefits Achieved:**
- Resolved `E11000 duplicate key error`.
- Enabled the system to store a history of drafts for each problem.
- Laid the groundwork for the reattempt and analysis history features.

---

### Phase 2: Centralized Frontend State with `AnalysisContext` (COMPLETED)

**Objective:**
- Create a single, reliable source for managing analysis data on the frontend.
- Reduce redundant API calls and prevent state management conflicts between components.

**Changes Made:**
1.  **`AnalysisContext.tsx` (New File)**:
    - Created a React Context to manage `analysis` data, `loading` states, and `error` messages.
    - Implemented `checkAnalysis` function with debouncing and smart retry logic (3 retries with exponential backoff).
    - Added `markReattempting` and `markSubmitting` functions to manage state via `sessionStorage` flags.
2.  **Component Integration**:
    - `App.tsx`: Wrapped the application layout with `AnalysisProvider`.
    - `CrucibleProblemPage`, `CrucibleWorkspaceView`, `ResultPage`: Refactored to use the `useAnalysis` hook instead of direct API calls for fetching the latest analysis.

**Benefits Achieved:**
- Centralized analysis state, making the frontend easier to manage and debug.
- Prevented excessive API calls through debouncing and controlled retries.
- Standardized the user flow for submission and reattempts.

---

### Phase 3: Robust Result Page Refactoring (COMPLETED)

**Objective:**
- Permanently fix the "Analysis Incomplete" error by creating a clear and predictable data flow on the `ResultPage`.
- Eliminate race conditions between local component state and the `AnalysisContext`.

**Changes Made:**
1.  **`ResultPage.tsx` Refactoring**:
    - **Clarified State Ownership**:
        - The component now manages its own `localAnalysis` state when an `analysisId` is provided in the URL.
        - It only relies on `contextAnalysis` when it needs the *latest* analysis for a given `problemId`.
    - **Simplified Data Flow**:
        - The main `useEffect` for data fetching is now simpler and only re-runs when the `analysisId` or `problemId` changes.
        - It no longer tries to manually sync its local state with the context, which was a source of errors.
    - **Single Source of Truth for Rendering**:
        - A new `analysisToDisplay` variable is used, which holds the definitive analysis data to show (either `localAnalysis` or `contextAnalysis`).
        - All validation (`isAnalysisValid`) and rendering logic now depend on this single, reliable source.
    - **Improved Loading and Error States**:
        - The `isLoading` and `displayError` variables now correctly reflect the state of both local and context-based data fetching.

**Benefits Achieved:**
- **Eliminated Race Conditions**: By separating the data fetching logic based on the available URL parameters (`analysisId` vs. `problemId`), the component's behavior is now predictable.
- **Permanent Fix**: The "Analysis Incomplete" error is resolved by ensuring that the component always has a reliable source of data to validate and render.
- **Improved Readability and Maintenance**: The code is now easier to understand and less prone to future state-related bugs.

---

### Phase 4: Excessive Backend API Calls During Submission (COMPLETED)

**Objective:**
- Prevent multiple rapid API calls to the backend during solution submission
- Eliminate 404 errors in backend logs when analysis is being generated
- Improve system stability during the submission process

**Changes Made:**
1. **Enhanced `AnalysisContext.tsx`**:
   - Added submission flag check in `checkAnalysis` function to prevent API calls during submission
   - Added submission flag check in `handleRetry` function to prevent retries during submission
   - Enhanced `markSubmitting` function to clear existing retry timeouts
   - Added proper logging for submission state management

**Key Features:**
- **Submission State Awareness**: Analysis checks now respect the submission flag
- **Timeout Management**: Existing retry timeouts are cleared during submission
- **Reduced Backend Load**: Eliminates unnecessary API calls during analysis generation
- **Better Error Handling**: Prevents 404 errors from appearing in backend logs

**Benefits Achieved:**
- Eliminated excessive backend API calls during submission
- Reduced backend load and error logs
- Improved user experience with cleaner submission flow
- Enhanced system stability during analysis generation

---

### Changelog

**v3.0 - Result Page Refactoring**
- Refactored `ResultPage.tsx` to have clear state ownership and a simplified data flow, permanently fixing the "Analysis Incomplete" error.
- Introduced `localAnalysis` state for direct fetches and `analysisToDisplay` as a single source of truth for rendering.
- Streamlined `useEffect` logic to prevent race conditions.

**v2.0 - Centralized State Management**
- Introduced `AnalysisContext.tsx` to manage all analysis-related state on the frontend.
- Implemented smart retry logic, debouncing, and `sessionStorage` flags for submission and reattempt flows.
- Refactored `CrucibleProblemPage`, `CrucibleWorkspaceView`, and `ResultPage` to use the new context.

**v1.0 - Backend and Database Fixes**
- Fixed `E11000 duplicate key error` by updating `solutionDraft` indexes.
- Implemented backend logic to support draft archiving and reattempts.
- Created a database migration script to apply schema changes.
