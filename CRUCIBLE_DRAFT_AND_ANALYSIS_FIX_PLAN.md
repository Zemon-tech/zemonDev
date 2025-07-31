# Crucible Draft and Analysis Fix Plan

## Overview
This plan addresses the issues with draft management, analysis workflow, and reattempt functionality in the Crucible problem-solving platform.

## Current Issues Identified

### 1. Database Schema Issues
- **Unique index constraint** on `{ userId: 1, problemId: 1 }` in `SolutionDraft` prevents multiple drafts for same user/problem
- **Missing draft archiving** in `analyzeUserSolution` function
- **No proper handling** of multiple analyses for same user/problem

### 2. Frontend Logic Issues
- **Incorrect state management** for reattempt scenarios
- **Wrong logic** for determining when to show editor vs result page
- **Missing proper draft status checking** in workspace view

### 3. Workflow Issues
- **Draft not archived** when solution is submitted for analysis
- **Reattempt creates new draft** but old analysis still exists
- **No proper separation** between active drafts and archived drafts

## Phase-by-Phase Implementation Plan

### Phase 1: Database Schema and Index Fixes
**Goal**: Remove problematic unique constraints and ensure proper draft/analysis management

#### 1.1 Remove Unique Index from SolutionDraft
- **File**: `backend/src/models/solutionDraft.model.ts`
- **Action**: Remove the unique compound index `{ userId: 1, problemId: 1 }`
- **Reason**: Allow multiple drafts for same user/problem (active + archived)
- **Risk**: Low - only affects new draft creation

#### 1.2 Add Proper Indexes for Performance
- **File**: `backend/src/models/solutionDraft.model.ts`
- **Action**: Add non-unique compound index `{ userId: 1, problemId: 1, status: 1 }`
- **Reason**: Efficient queries for active/archived drafts
- **Risk**: Low - performance improvement

#### 1.3 Verify SolutionAnalysis Indexes
- **File**: `backend/src/models/solutionAnalysis.model.ts`
- **Action**: Ensure no unique constraints that would prevent multiple analyses
- **Reason**: Allow multiple analyses for same user/problem
- **Risk**: Low - verification only

### Phase 2: Backend Controller Logic Fixes
**Goal**: Fix draft archiving and analysis workflow

#### 2.1 Fix analyzeUserSolution Function
- **File**: `backend/src/controllers/crucible.controller.ts`
- **Action**: Add draft archiving logic before analysis
- **Changes**:
  - Archive current active draft before creating analysis
  - Update user's draft references (activeDrafts → archivedDrafts)
  - Ensure proper error handling
- **Risk**: Medium - affects core analysis workflow

#### 2.2 Update getDraft Function
- **File**: `backend/src/controllers/solutionDraft.controller.ts`
- **Action**: Modify to only return active drafts
- **Changes**:
  - Query only for `status: 'active'` drafts
  - Remove upsert logic (let reattempt handle new draft creation)
  - Ensure proper error handling for missing drafts
- **Risk**: Low - affects draft retrieval only

#### 2.3 Update reattemptDraft Function
- **File**: `backend/src/controllers/solutionDraft.controller.ts`
- **Action**: Ensure proper new draft creation
- **Changes**:
  - Archive any existing active draft first
  - Create new draft with `status: 'active'`
  - Update user's draft references
- **Risk**: Low - affects reattempt workflow only

### Phase 3: Frontend Logic Fixes
**Goal**: Fix state management and UI logic for proper workflow

#### 3.1 Fix CrucibleWorkspaceView Logic
- **File**: `frontend/src/components/crucible/CrucibleWorkspaceView.tsx`
- **Action**: Improve draft status checking and state management
- **Changes**:
  - Check for active draft first, then check for latest analysis
  - Proper handling of reattempt state
  - Clear separation between editor and result page logic
- **Risk**: Medium - affects core UI logic

#### 3.2 Update CrucibleProblemPage
- **File**: `frontend/src/pages/CrucibleProblemPage.tsx`
- **Action**: Improve error handling for draft loading
- **Changes**:
  - Better error handling when no active draft exists
  - Proper fallback to result page when appropriate
- **Risk**: Low - affects page loading only

#### 3.3 Fix ResultPage Logic
- **File**: `frontend/src/pages/ResultPage.tsx`
- **Action**: Ensure proper analysis fetching and display
- **Changes**:
  - Always fetch latest analysis for user/problem
  - Proper error handling for missing analyses
  - Clear reattempt button functionality
- **Risk**: Low - affects result display only

### Phase 4: API Client Updates
**Goal**: Ensure frontend API calls work with updated backend

#### 4.1 Update crucibleApi.ts
- **File**: `frontend/src/lib/crucibleApi.ts`
- **Action**: Ensure all API calls handle new backend behavior
- **Changes**:
  - Update error handling for draft operations
  - Ensure proper token handling
  - Add any missing API functions if needed
- **Risk**: Low - affects API communication only

### Phase 5: Testing and Validation
**Goal**: Ensure all functionality works correctly

#### 5.1 Test Scenarios
- **New user solving problem**: Should see editor, submit, see result
- **User reattempting problem**: Should see editor after reattempt, submit, see new result
- **User visiting solved problem**: Should see result page with reattempt button
- **User visiting reattempted problem**: Should see result page with latest analysis

#### 5.2 Edge Cases
- **Multiple reattempts**: Should work correctly
- **Network errors**: Should handle gracefully
- **Database errors**: Should show appropriate error messages

## Implementation Details

### Database Migration Strategy
1. **Remove unique index** without data migration (safe operation)
2. **Add new indexes** for performance
3. **No data loss** - all existing data preserved

### Backward Compatibility
- **All existing functionality** preserved
- **No breaking changes** to public APIs
- **Gradual rollout** possible

### Error Handling
- **Graceful degradation** when drafts don't exist
- **Clear error messages** for users
- **Proper logging** for debugging

## Success Criteria

### Functional Requirements
- ✅ User can submit solution and see analysis
- ✅ User can reattempt problem and get new editor
- ✅ User sees result page when visiting solved problem
- ✅ User can submit multiple solutions for same problem
- ✅ All existing functionality preserved

### Technical Requirements
- ✅ No unique constraint violations
- ✅ Proper draft archiving on submission
- ✅ Correct state management in frontend
- ✅ Efficient database queries
- ✅ Proper error handling

### User Experience Requirements
- ✅ Clear workflow for problem solving
- ✅ Intuitive reattempt functionality
- ✅ Proper loading states
- ✅ Clear error messages

## Risk Assessment

### High Risk
- None identified

### Medium Risk
- **Draft archiving logic**: Core workflow change
- **Frontend state management**: Complex logic changes

### Low Risk
- **Database index changes**: Safe operations
- **API client updates**: Backward compatible
- **Error handling improvements**: Additive changes

## Rollback Plan

### If Issues Arise
1. **Database**: Restore unique index (safe operation)
2. **Backend**: Revert controller changes
3. **Frontend**: Revert component changes
4. **No data loss** in any scenario

## Dependencies

- **Database access** for index changes
- **Backend server** for controller updates
- **Frontend build** for component updates
- **User testing** for validation

## Approval Required

This plan requires approval before implementation to ensure:
- All changes are understood
- Risk assessment is acceptable
- Timeline is reasonable
- Success criteria are clear

---

## Changelog

### Phase 1: Database Schema and Index Fixes ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Removed unique constraint** from `SolutionDraft` model:
   - Removed: `SolutionDraftSchema.index({ userId: 1, problemId: 1 }, { unique: true });`
   - **Impact**: Now allows multiple drafts for same user/problem (active + archived)

2. **Added performance indexes** to `SolutionDraft` model:
   - Added: `SolutionDraftSchema.index({ userId: 1, problemId: 1, status: 1 });`
   - Added: `SolutionDraftSchema.index({ userId: 1, problemId: 1 });`
   - **Impact**: Efficient queries for active/archived drafts

3. **Verified SolutionAnalysis indexes**:
   - Confirmed no unique constraints prevent multiple analyses
   - **Impact**: Multiple analyses allowed for same user/problem

#### Files Modified:
- `backend/src/models/solutionDraft.model.ts`

#### Risk Level: Low
- Safe database operations
- No data migration required
- All existing data preserved

---

### Phase 2: Backend Controller Logic Fixes ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Fixed analyzeUserSolution function**:
   - Added draft archiving logic before analysis
   - Archives current active draft and updates user references
   - **Impact**: Drafts are properly archived when solutions are submitted

2. **Updated getDraft function**:
   - Removed upsert logic (let reattempt handle new draft creation)
   - Only returns active drafts, returns 404 if no active draft exists
   - **Impact**: Cleaner separation between draft retrieval and creation

3. **Updated reattemptDraft function**:
   - Archives any existing active draft first
   - Creates new draft with `status: 'active'`
   - Properly updates user's draft references
   - **Impact**: Clean reattempt workflow with proper state management

#### Files Modified:
- `backend/src/controllers/crucible.controller.ts`
- `backend/src/controllers/solutionDraft.controller.ts`

#### Risk Level: Medium
- Core workflow changes
- Draft archiving logic affects analysis process
- Proper error handling implemented 

---

### Phase 3: Frontend Logic Fixes ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Fixed CrucibleWorkspaceView Logic**:
   - Improved draft status checking with better error handling
   - Enhanced reattempt state management
   - Clearer render logic for editor vs result page display
   - Better separation between active draft and analysis states
   - **Impact**: Proper determination of when to show editor vs result page

2. **Updated CrucibleProblemPage**:
   - Improved error handling for draft loading
   - Graceful handling when no active draft exists
   - Better fallback behavior for missing drafts
   - **Impact**: Page loads successfully even when no active draft exists

3. **Enhanced ResultPage Logic**:
   - Added fetching of latest analysis when on problem result route
   - Better error handling for missing analyses
   - Improved user feedback for different scenarios
   - **Impact**: Always shows latest analysis when visiting result page

#### Files Modified:
- `frontend/src/components/crucible/CrucibleWorkspaceView.tsx`
- `frontend/src/pages/CrucibleProblemPage.tsx`
- `frontend/src/pages/ResultPage.tsx`

#### Risk Level: Medium
- Core UI logic changes
- State management improvements

---

### Phase 4: API Client Updates ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Enhanced Error Handling in API Client**:
   - Improved `handleResponse` function to parse error messages from backend
   - Better error message extraction from JSON responses
   - **Impact**: More user-friendly error messages

2. **Updated getDraft Function**:
   - Now returns `ISolutionDraft | null` instead of throwing on 404
   - Gracefully handles cases where no active draft exists
   - **Impact**: Cleaner error handling for missing drafts

3. **Enhanced submitSolutionForAnalysis Function**:
   - Added specific error handling for different HTTP status codes
   - User-friendly error messages for AI service issues
   - **Impact**: Better user experience during analysis failures

4. **Updated getLatestAnalysis Function**:
   - Now returns `ISolutionAnalysisResult | null` instead of throwing on 404
   - Gracefully handles cases where no analysis exists
   - **Impact**: Cleaner error handling for missing analyses

#### Files Modified:
- `frontend/src/lib/crucibleApi.ts`

#### Risk Level: Low
- API interface improvements
- Better error handling
- No breaking changes to existing functionality

---

### Phase 1: Fix CrucibleWorkspaceView Logic ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Fixed checkSubmission Logic**:
   - Added proper handling for new users (when `initialDraft` is `null`)
   - Only check for analysis when user has archived draft (not active)
   - **Impact**: New users see editor immediately, no unnecessary API calls

2. **Updated Render Logic**:
   - Show editor for new users (`!initialDraft`), active drafts, and reattempts
   - **Impact**: Proper UI display for all user scenarios

3. **Enhanced CrucibleProblemPage**:
   - Added automatic draft creation for new users
   - Import `updateDraft` function for draft creation
   - **Impact**: New users get a draft created automatically when visiting a problem

#### Files Modified:
- `frontend/src/components/crucible/CrucibleWorkspaceView.tsx`
- `frontend/src/pages/CrucibleProblemPage.tsx`

#### Risk Level: Low
- Core logic fixes
- Better user experience for new users
- No breaking changes to existing functionality

---

### Phase 2: Optimize API Calls ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Enhanced Autosave Logic**:
   - Added loading states (`isSavingDraft`) to prevent race conditions
   - Skip autosave when no content or already saving
   - Better error handling without user alerts for autosave failures
   - **Impact**: Reduced unnecessary API calls and improved performance

2. **Optimized checkSubmission Logic**:
   - Added loading state (`isCheckingSubmission`) to prevent concurrent checks
   - Better mounted state handling to prevent memory leaks
   - **Impact**: Prevents race conditions and unnecessary API calls

3. **Improved Draft Versions Fetching**:
   - Only fetch versions when version history is shown and draft exists
   - Better error handling with logging instead of silent failures
   - **Impact**: Reduced API calls and better error visibility

4. **Added Visual Feedback**:
   - Added saving indicator with spinner animation
   - Shows "Saving..." status when autosave is in progress
   - **Impact**: Better user experience with clear feedback

5. **Rate Limiting Review**:
   - Verified rate limiting configuration is appropriate
   - Standard limiter allows 500 requests per 15 minutes (sufficient for normal usage)
   - **Impact**: No rate limiting issues identified

#### Files Modified:
- `frontend/src/components/crucible/CrucibleWorkspaceView.tsx`

#### Risk Level: Low
- Performance optimizations
- Better user experience
- No breaking changes to existing functionality

---

### Phase 3: Bug Fixes ✅ COMPLETED
**Date**: [Current Date]

#### Changes Made:
1. **Fixed Unnecessary Draft Updates**:
   - Added `lastSavedContent` state to track actual content changes
   - Only save when content has actually changed from last saved version
   - Update tracking when initialDraft changes
   - **Impact**: Eliminates unnecessary API calls when content hasn't changed

2. **Fixed "No Analysis Found" Error**:
   - Added retry mechanism with progressive delays (3s, 6s, 9s, 12s, 15s) for analysis fetching
   - Retry up to 5 times before showing "no analysis" message
   - Keep loading state active during retries instead of showing error
   - Updated loading message to set proper expectations (up to 45 seconds)
   - **Impact**: Handles cases where analysis is still being processed after submission

3. **Fixed Duplicate Key Error on Failed Analysis**:
   - Created migration script to remove unique index from database
   - Added `ensureActiveDraft` helper function to create a new draft when needed
   - Automatically create a new draft when redirected back after analysis failure
   - **Impact**: Prevents errors when analysis fails and user is redirected back to editor

4. **Fixed Render Logic for Submitted Problems**:
   - Added `!hasSubmitted` condition to render logic to prioritize submission status
   - Added loading state while checking submission status to prevent UI flicker
   - Improved `checkSubmission` function with early return after redirect
   - **Impact**: Users now see result page instead of editor when visiting submitted problems

5. **Fixed Infinite Loading State Issue**:
   - Removed `isCheckingSubmission` from dependency array to prevent infinite loop
   - Added 10-second safety timeout to prevent stuck loading states
   - Improved loading state rendering to only show when needed
   - **Impact**: Prevents users from getting stuck on loading screens

6. **Fixed Navigation to Result Page**:
   - Added early analysis check in `CrucibleProblemPage` to redirect immediately on page load
   - Improved `checkSubmission` function to always check for analysis first
   - Optimized render logic to prioritize submission status
   - Added prevention of redundant redirects
   - **Impact**: Users now correctly see the result page when visiting a problem they've already submitted

#### Files Modified:
- `frontend/src/components/crucible/CrucibleWorkspaceView.tsx`
- `frontend/src/pages/CrucibleProblemPage.tsx`
- `frontend/src/pages/ResultPage.tsx`
- `backend/src/migrations/fix-solution-draft-indexes.ts` (new file)

#### Risk Level: Low
- Bug fixes only
- No breaking changes
- Improved user experience 