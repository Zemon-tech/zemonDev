# Crucible Profile Tab Implementation Plan

## Overview
This plan outlines the implementation of real data integration for the Crucible tab in the profile page, replacing dummy data with actual user analysis history and active drafts.

## Current State Analysis
- **ProfilePage.tsx**: Currently uses `mockUserData.crucible` with dummy data for:
  - Solution Journeys: `["Distributed Cache System", "ML Pipeline Automation"]`
  - Active Drafts: `["Distributed Cache System", "ML Pipeline Automation"]`
- **Existing APIs**: 
  - `getAnalysisHistory(problemId, getToken)` - Gets analysis history for a specific problem
  - `getDraft(problemId, getToken)` - Gets draft for a specific problem
- **Missing APIs**: Need endpoints to get user's analysis history and active drafts across all problems

## Phase 1: Backend API Development

### 1.1 Create New API Endpoints

#### 1.1.1 User Analysis History Endpoint
- **Route**: `GET /api/profile/crucible/analyses`
- **Controller**: `getUserAnalysisHistory` in `profile.controller.ts`
- **Functionality**: 
  - Get all analyses for the current user across all problems
  - Sort by `createdAt` descending (most recent first)
  - Limit to 2 most recent analyses
  - Include problem title by populating `problemId` reference
  - Return: `{ analyses: ISolutionAnalysisResult[], problemTitles: string[] }`

#### 1.1.2 User Active Drafts Endpoint
- **Route**: `GET /api/profile/crucible/drafts`
- **Controller**: `getUserActiveDrafts` in `profile.controller.ts`
- **Functionality**:
  - Get all active drafts for the current user across all problems
  - Sort by `lastEdited` descending (most recently edited first)
  - Limit to 2 most recent active drafts
  - Include problem title by populating `problemId` reference
  - Return: `{ drafts: ISolutionDraft[], problemTitles: string[] }`

### 1.2 Create Profile Controller
- **File**: `backend/src/controllers/profile.controller.ts`
- **Purpose**: Centralized controller for all profile page related functionality
- **Functions**:
  - `getUserAnalysisHistory` - Get user's recent analyses
  - `getUserActiveDrafts` - Get user's active drafts
  - Future profile-related functions can be added here

### 1.3 Create Profile Routes
- **File**: `backend/src/api/profile.routes.ts`
- **Routes**:
  - `GET /api/profile/crucible/analyses` - Get user analysis history
  - `GET /api/profile/crucible/drafts` - Get user active drafts
- **Middleware**: `protect` for authentication, `standardLimiter` for rate limiting
- **Organization**: All profile-related endpoints in one place

### 1.4 Database Optimization
- Ensure proper indexes exist for efficient queries
- Add compound indexes if needed for `userId + createdAt` and `userId + lastEdited`
- Optimize for small result sets (2 items) with proper sorting

## Phase 2: Frontend API Integration

### 2.1 Create New API Functions
- **File**: `frontend/src/lib/profileApi.ts` (new file)
- **Functions**:
  - `getUserAnalysisHistory(getToken)` - Get user's recent analyses
  - `getUserActiveDrafts(getToken)` - Get user's active drafts
- **Organization**: Separate API file for profile-related functions

### 2.2 Type Definitions
- **File**: `frontend/src/lib/profileApi.ts`
- **Interfaces**:
  - `IUserAnalysisHistory` - Response type for analysis history
  - `IUserActiveDrafts` - Response type for active drafts
- **Organization**: Types defined in the same file as the API functions

## Phase 3: Profile Page Integration

### 3.1 Update ProfilePage Component
- **File**: `frontend/src/pages/ProfilePage.tsx`
- **Changes**:
  - Replace `mockUserData.crucible` with real data fetching
  - Add state management for analysis history and active drafts
  - Add loading states for data fetching
  - Add error handling for API failures
  - Import new API functions from `profileApi.ts`

### 3.2 Data Fetching Logic
- **Hook**: `useEffect` for data fetching
- **Dependencies**: `user`, `getToken`
- **Error Handling**: Graceful fallback to empty arrays if API fails
- **Loading States**: Show loading indicators while fetching

### 3.3 Navigation Implementation
- **Solution Journeys**: Click navigates to `/crucible/results/${analysisId}`
- **Active Drafts**: Click navigates to `/crucible/problem/${problemId}`
- **Username Extraction**: Use `useParams` to get username for navigation

## Phase 4: UI/UX Enhancements

### 4.1 Loading States
- Show skeleton loaders while data is being fetched
- Maintain existing animations and transitions

### 4.2 Empty States
- Show appropriate messages when no data is available
- "No solution journeys yet" for empty analysis history
- "No active drafts" for empty drafts
- Show "2 recent solutions" and "2 recent drafts" in section headers

### 4.3 Error Handling
- Show user-friendly error messages
- Provide retry functionality
- Fallback to empty state if API fails

### 4.4 Data Display
- Show problem titles instead of dummy text
- Maintain existing card layout and styling
- Keep existing animations and hover effects

## Phase 5: Testing & Validation

### 5.1 Backend Testing
- Test new API endpoints with valid/invalid tokens
- Test with users who have no data
- Test with users who have multiple analyses/drafts
- Verify proper sorting and limiting (exactly 2 items)
- Test sorting: analyses by createdAt, drafts by lastEdited

### 5.2 Frontend Testing
- Test data fetching and state management
- Test navigation functionality
- Test error handling and loading states
- Test with different user scenarios

### 5.3 Integration Testing
- End-to-end testing of complete flow
- Test with real user data
- Verify no breaking changes to existing functionality

## Phase 6: Performance Optimization

### 6.1 Backend Optimization
- Add caching for frequently accessed data
- Optimize database queries
- Add pagination if needed in future

### 6.2 Frontend Optimization
- Implement proper memoization
- Add request deduplication
- Optimize re-renders

## Implementation Details

### Backend Controller Functions

#### `getUserAnalysisHistory`
```typescript
// File: backend/src/controllers/profile.controller.ts
export const getUserAnalysisHistory = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const analyses = await SolutionAnalysis.find({ userId })
      .populate('problemId', 'title')
      .sort({ createdAt: -1 })
      .limit(2);
    
    res.status(200).json(
      new ApiResponse(200, 'User analysis history retrieved successfully', analyses)
    );
  }
);
```

#### `getUserActiveDrafts`
```typescript
// File: backend/src/controllers/profile.controller.ts
export const getUserActiveDrafts = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user._id;
    const drafts = await SolutionDraft.find({ userId, status: 'active' })
      .populate('problemId', 'title')
      .sort({ lastEdited: -1 })
      .limit(2);
    
    res.status(200).json(
      new ApiResponse(200, 'User active drafts retrieved successfully', drafts)
    );
  }
);
```

### Frontend API Functions

#### `getUserAnalysisHistory`
```typescript
// File: frontend/src/lib/profileApi.ts
export async function getUserAnalysisHistory(
  getToken: () => Promise<string | null>
): Promise<ISolutionAnalysisResult[]> {
  return apiRequest<ISolutionAnalysisResult[]>(
    '/api/profile/crucible/analyses',
    {},
    getToken
  );
}
```

#### `getUserActiveDrafts`
```typescript
// File: frontend/src/lib/profileApi.ts
export async function getUserActiveDrafts(
  getToken: () => Promise<string | null>
): Promise<ISolutionDraft[]> {
  return apiRequest<ISolutionDraft[]>(
    '/api/profile/crucible/drafts',
    {},
    getToken
  );
}
```

## Risk Assessment & Mitigation

### Risks
1. **Breaking Changes**: Modifying existing ProfilePage component
2. **Performance**: Additional API calls on profile page load
3. **Data Consistency**: Ensuring proper data relationships
4. **Error Handling**: Graceful degradation if APIs fail

### Mitigation Strategies
1. **Incremental Implementation**: Implement phases one by one
2. **Backward Compatibility**: Maintain existing functionality
3. **Error Boundaries**: Proper error handling at each level
4. **Testing**: Comprehensive testing at each phase
5. **Fallbacks**: Graceful fallbacks to empty states

## Success Criteria
- [ ] Solution Journeys show exactly 2 most recent problem titles from user's analysis history
- [ ] Active Drafts show exactly 2 most recent problem titles from user's active drafts (sorted by lastEdited)
- [ ] Clicking on Solution Journey navigates to correct analysis result page
- [ ] Clicking on Active Draft navigates to correct problem solution editor
- [ ] Loading states work properly
- [ ] Error handling works gracefully
- [ ] No breaking changes to existing functionality
- [ ] Performance remains acceptable

## Dependencies
- Existing authentication system
- Existing database models
- Existing API infrastructure
- Existing UI components and styling
- New profile controller and routes structure 