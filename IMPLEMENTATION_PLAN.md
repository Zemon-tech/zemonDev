 # Implementation Plan for Crucible Problem Page and Result Page Changes

## Overview
This plan outlines the implementation of requested changes to the ProfilePage, SettingsPage, and related components. The changes focus on UI modifications, database schema updates, and feature implementations while maintaining existing functionality.

## Phase 1: Database Schema Updates and Backend API Enhancements

### 1.1 Update User Model Schema
**Files to modify:**
- `backend/src/models/user.model.ts`

**Changes:**
- Add `zemonStreak` field (number, default: 0)
- Add `longestZemonStreak` field (number, default: 0)
- Add `lastZemonVisit` field (Date) for tracking daily visits
- Ensure `bio` field exists in profile section
- Add `college` details fields if not present

**Implementation:**
```typescript
// Add to UserSchema
zemonStreak: {
  type: Number,
  default: 0,
  min: 0
},
longestZemonStreak: {
  type: Number,
  default: 0,
  min: 0
},
lastZemonVisit: {
  type: Date,
  default: null
}
```

### 1.2 Create Zemon Streak Service
**New file:** `backend/src/services/zemonStreak.service.ts`

**Features:**
- Track daily user visits
- Calculate and update streak counters
- Handle streak breaks and resets
- Update longest streak when current streak exceeds it

**API Endpoints:**
- `POST /api/users/me/visit` - Record daily visit
- `GET /api/users/me/streak` - Get current streak info

### 1.3 Update User Controller
**Files to modify:**
- `backend/src/controllers/user.controller.ts`

**New functions:**
- `recordDailyVisit` - Handle daily visit tracking
- `getStreakInfo` - Return streak statistics
- Enhanced `updateCurrentUser` - Support bio and college updates

### 1.4 Update User Routes
**Files to modify:**
- `backend/src/api/user.routes.ts`

**New routes:**
- `POST /me/visit` - Record daily visit
- `GET /me/streak` - Get streak info
- Enhanced `PATCH /me` - Support all profile fields

## Phase 2: Profile Page UI Modifications

### 2.1 Hide Featured Projects and Recent Activity in Overview
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`

**Changes:**
- Add conditional rendering to hide "Featured Projects" and "Recent Activity" sections
- Keep the sections in code but hide them with CSS or conditional rendering
- Ensure no functionality is broken

### 2.2 Fix Social Links Theme in Contact Tab
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`

**Changes:**
- Update social link buttons to use DaisyUI theme classes
- Ensure buttons match the overall UI theme
- Test all social link functionality

### 2.3 Hide Arena and Innovation & Workspace Tabs
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`

**Changes:**
- Add conditional rendering to hide "Arena" and "Innovation & Workspace" tabs
- Keep tabs in code but hide them
- Ensure tab navigation still works properly

### 2.4 Hide Research Notes and System Diagrams in Crucible Tab
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`

**Changes:**
- Hide "Research Notes" and "System Diagrams" sections in Crucible tab
- Keep sections in code but hide them
- Ensure other Crucible sections remain functional

### 2.5 Add Bottom Gap to All Tabs
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`

**Changes:**
- Add consistent bottom padding/margin to all tab content
- Ensure proper spacing at the end of scrollable content
- Test on different screen sizes

## Phase 3: Forge Page Modifications

### 3.1 Hide Related Resources and Community Reviews
**Files to modify:**
- `frontend/src/pages/ForgePage.tsx`
- `frontend/src/pages/ForgeDetailPage.tsx`

**Changes:**
- Hide "Related Resources" and "Community Reviews" sections
- Keep sections in code but hide them
- Ensure main resource functionality remains intact

### 3.2 Link Bookmark Resources to Database
**Files to modify:**
- `frontend/src/pages/ForgePage.tsx`
- `frontend/src/components/blocks/ResourceCard.tsx`
- `frontend/src/lib/forgeApi.ts`

**Changes:**
- Implement bookmark functionality using database
- Add bookmark/unbookmark API calls
- Update UI to reflect bookmark status
- Ensure proper error handling

**Backend API needed:**
- `POST /api/forge/resources/:id/bookmark` - Bookmark resource
- `DELETE /api/forge/resources/:id/bookmark` - Remove bookmark
- `GET /api/forge/resources/bookmarked` - Get bookmarked resources

## Phase 4: Zemon Streak Feature Implementation

### 4.1 Frontend Streak Tracking
**Files to modify:**
- `frontend/src/hooks/useZemonStreak.ts` (new file)
- `frontend/src/pages/ProfilePage.tsx`

**Features:**
- Track daily visits automatically
- Display current streak and longest streak
- Show streak progress and statistics
- Handle streak breaks and celebrations

### 4.2 Streak UI Components
**New files:**
- `frontend/src/components/ui/StreakCounter.tsx`
- `frontend/src/components/ui/StreakProgress.tsx`

**Features:**
- Visual streak counter with animations
- Progress indicators
- Streak milestone celebrations
- Responsive design

### 4.3 Link Bio and Streak to Profile Page
**Files to modify:**
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/hooks/useUserProfile.ts`

**Changes:**
- Display bio from database in profile
- Show streak information prominently
- Update bio editing functionality
- Ensure real-time updates

## Phase 5: Settings Page Database Integration ✅ COMPLETED

### 5.1 Profile Section Database Integration ✅
**Files modified:**
- `frontend/src/pages/SettingsPage.tsx`
- `frontend/src/lib/settingsApi.ts` (created)

**Features implemented:**
- ✅ Load all profile data from database
- ✅ Save profile changes to database
- ✅ Real-time validation
- ✅ Error handling and user feedback

### 5.2 Account Section Database Integration ✅
**Files modified:**
- `frontend/src/pages/SettingsPage.tsx`
- `backend/src/controllers/user.controller.ts`
- `backend/src/api/user.routes.ts`

**Features implemented:**
- ✅ Load college details from database
- ✅ Save college information
- ✅ Password change functionality
- ✅ Session management
- ✅ Account deletion

### 5.3 Skills Management ✅
**Files modified:**
- `frontend/src/pages/SettingsPage.tsx`

**Features implemented:**
- ✅ Load skills from database
- ✅ Add/remove skills dynamically
- ✅ Skills validation
- ✅ Auto-save functionality

## Phase 6: Testing and Validation

### 6.1 Frontend Testing
- Test all UI modifications
- Verify no broken functionality
- Test responsive design
- Validate accessibility

### 6.2 Backend Testing
- Test all new API endpoints
- Verify database operations
- Test streak calculation logic
- Validate error handling

### 6.3 Integration Testing
- Test complete user flows
- Verify data consistency
- Test edge cases
- Performance testing

## Implementation Order

1. **Phase 1** - Database and Backend (Foundation)
2. **Phase 2** - Profile Page UI (Visual changes)
3. **Phase 3** - Forge Page (Resource management)
4. **Phase 4** - Zemon Streak (New feature)
5. **Phase 5** - Settings Integration (Data management)
6. **Phase 6** - Testing (Quality assurance)

## Risk Mitigation

### Technical Risks
- **Breaking existing functionality**: Test thoroughly after each change
- **Database migration issues**: Create migration scripts
- **Performance impact**: Monitor API response times
- **UI inconsistencies**: Use consistent DaisyUI components

### Implementation Risks
- **Complex streak logic**: Implement incrementally
- **Data loss**: Backup before schema changes
- **User experience**: Maintain familiar UI patterns
- **Cross-browser compatibility**: Test on multiple browsers

## Success Criteria

1. All requested UI elements are hidden (not deleted)
2. Social links match DaisyUI theme
3. Zemon streak feature works correctly
4. All database operations function properly
5. Settings page is fully functional
6. No existing functionality is broken
7. Performance remains acceptable
8. Code is maintainable and well-documented

## Dependencies

- DaisyUI theme system
- Existing user authentication (Clerk)
- MongoDB database
- Express.js backend
- React frontend
- Framer Motion for animations

## Timeline Estimate

- **Phase 1**: 2-3 days
- **Phase 2**: 1-2 days
- **Phase 3**: 1-2 days
- **Phase 4**: 2-3 days
- **Phase 5**: 2-3 days
- **Phase 6**: 1-2 days

**Total estimated time**: 9-15 days

## Notes

- All changes should be made incrementally
- Each phase should be tested before moving to the next
- Maintain existing code structure and patterns
- Use TypeScript for type safety
- Follow existing naming conventions
- Document any new APIs or components