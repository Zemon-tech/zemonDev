# Changelog

## Phase 1: Database Schema Updates and Backend API Enhancements

### Backend Changes

#### Database Schema Updates
- **File**: `backend/src/models/user.model.ts`
  - Added `zemonStreak` field (number, default: 0, min: 0)
  - Added `longestZemonStreak` field (number, default: 0, min: 0)
  - Added `lastZemonVisit` field (Date, default: null)
  - Updated TypeScript interface to include new streak fields

#### New Service
- **File**: `backend/src/services/zemonStreak.service.ts` (NEW)
  - Created comprehensive streak tracking service
  - Functions:
    - `recordDailyVisit()` - Records daily visit and updates streak counters
    - `getStreakInfo()` - Gets current streak information without recording visit
    - `resetStreak()` - Resets user streak (for testing/admin purposes)
  - Handles consecutive day logic, streak breaks, and longest streak tracking
  - Includes proper date comparison logic for daily visits

#### Controller Updates
- **File**: `backend/src/controllers/user.controller.ts`
  - Enhanced `updateCurrentUser()` to support `college` and `socialLinks` fields
  - Added `recordDailyVisitController()` - Handles POST /api/users/me/visit
  - Added `getStreakInfoController()` - Handles GET /api/users/me/streak
  - Imported streak service functions

#### Route Updates
- **File**: `backend/src/api/user.routes.ts`
  - Added `POST /me/visit` route for recording daily visits
  - Added `GET /me/streak` route for getting streak information
  - Both routes are protected and require authentication

### API Endpoints Added
- `POST /api/users/me/visit` - Record daily visit and update streak
- `GET /api/users/me/streak` - Get current streak information

### Database Fields Added
- `zemonStreak` - Current consecutive day streak
- `longestZemonStreak` - Longest streak achieved
- `lastZemonVisit` - Timestamp of last visit

### Technical Details
- All new fields have proper validation and defaults
- Streak logic handles timezone and date comparison correctly
- Service functions include comprehensive error handling
- API responses follow existing patterns with ApiResponse wrapper
- All changes maintain backward compatibility

### Testing Notes
- Streak calculation logic tested for edge cases
- Date comparison handles different timezones
- Error handling covers all failure scenarios
- API endpoints return consistent response format

## Phase 2: Profile Page UI Modifications

### Frontend Changes

#### Overview Tab Modifications
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Hidden "Featured Projects" section (commented out, not deleted)
  - Hidden "Recent Activity" section (commented out, not deleted)
  - Both sections remain in code for future reactivation

#### Contact Tab Social Links Update
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Updated social link buttons to use DaisyUI theme classes
  - Changed from custom `bg-*` classes to `btn-*` classes
  - Added proper button styling with `btn btn-sm` classes
  - Enhanced hover effects with `hover:scale-105`
  - Social links now match the overall UI theme consistently

#### Tab Navigation Updates
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Hidden "Arena" tab (commented out, not deleted)
  - Hidden "Innovation & Workspace" tab (commented out, not deleted)
  - Tab navigation still functions properly with remaining tabs

#### Crucible Tab Modifications
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Hidden "Research Notes" section (commented out, not deleted)
  - Hidden "System Diagrams" section (commented out, not deleted)
  - Only "Solution Journeys" and "Active Drafts" remain visible
  - All functionality preserved for future reactivation

#### Bottom Spacing Enhancement
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Added consistent `mb-10` (margin-bottom: 2.5rem) to all tab content
  - Applied to: Overview, Crucible, Achievements, and Innovation tabs
  - Ensures proper spacing at the end of scrollable content
  - Improves user experience on all screen sizes

### UI/UX Improvements
- All hidden sections are preserved in code with clear comments
- Social links now use consistent DaisyUI theming
- Bottom spacing provides better visual hierarchy
- Tab navigation remains functional and intuitive
- No existing functionality was broken during modifications

### Technical Details
- Used CSS comments to hide sections instead of deletion
- Maintained all existing animations and transitions
- Preserved component structure for easy reactivation
- Added consistent spacing across all tab content
- Enhanced social link accessibility and styling

## Phase 3: Forge Page Modifications

### Frontend Changes

#### Bookmark Functionality Implementation
- **File**: `frontend/src/lib/forgeApi.ts`
  - Added `toggleBookmark()` function to bookmark/unbookmark resources
  - Added `getBookmarkedResources()` function to fetch user's bookmarked resources
  - Proper error handling and authentication checks

#### ResourceCard Component Enhancement
- **File**: `frontend/src/components/blocks/ResourceCard.tsx`
  - Added bookmark button with visual feedback
  - Updated Resource type to include `isBookmarked` property
  - Added `onBookmark` prop for bookmark functionality
  - Bookmark button shows filled/unfilled state based on bookmark status
  - Proper event handling to prevent card click when bookmarking

#### ForgePage Integration
- **File**: `frontend/src/pages/ForgePage.tsx`
  - Added bookmark state management
  - Integrated bookmark functionality with ResourceCard
  - Added `handleBookmark()` function for bookmark toggle
  - Loads user's bookmarked resources on component mount
  - Updates local state when bookmark status changes

### Backend Integration
- **Backend**: Already implemented bookmark functionality
  - `POST /api/forge/:id/bookmark` endpoint for toggling bookmarks
  - User model includes `bookmarkedResources` array
  - ForgeResource model includes bookmark metrics

### UI/UX Improvements
- Bookmark button with visual feedback (filled/unfilled icon)
- Smooth transitions and hover effects
- Proper error handling for bookmark operations
- Real-time updates of bookmark status
- Consistent styling with existing UI components

### Technical Details
- Bookmark state is managed locally and synced with backend
- Proper authentication checks before bookmark operations
- Error handling for failed bookmark operations
- Bookmark status persists across page reloads
- No breaking changes to existing functionality

### Hidden Sections
- **Created Resources**: Hidden in ProfilePage forge tab (commented out, not deleted)
- **Community Reviews**: Hidden in ProfilePage forge tab (commented out, not deleted)
- **Related Articles**: Hidden in ProblemDetailsSidebar (commented out, not deleted)
- All sections remain in code for future reactivation

### Database Integration
- **Bookmarked Resources**: Now fetches real data from database in ProfilePage
- **ForgePage**: Full bookmark functionality with database integration
- **ResourceCard**: Enhanced with bookmark button and visual feedback
- All bookmark operations are properly linked to MongoDB database

## Phase 4: Zemon Streak Feature Implementation

### Frontend Changes

#### Streak Tracking Hook
- **File**: `frontend/src/hooks/useZemonStreak.ts` (NEW)
  - Created comprehensive streak tracking hook
  - Auto-records daily visits when user hasn't visited today
  - Fetches current streak information from backend
  - Proper error handling and loading states
  - Real-time streak updates

#### ProfilePage Integration (Minimal Changes)
- **File**: `frontend/src/pages/ProfilePage.tsx`
  - Integrated streak functionality with useZemonStreak hook
  - Updated existing Zemon Streak stat card to show real data
  - **No layout changes** - kept existing design exactly the same
  - Added loading state for streak data
  - Real-time streak updates without disrupting UI

### Backend Integration
- **Backend**: Already implemented in Phase 1
  - `POST /api/users/me/visit` - Records daily visits
  - `GET /api/users/me/streak` - Gets streak information
  - Database fields: `zemonStreak`, `longestZemonStreak`, `lastZemonVisit`

### Features Implemented
- **Daily Visit Tracking**: Automatically records when users visit Zemon daily
- **Streak Calculation**: Tracks consecutive days and longest streaks
- **Real-time Updates**: Streak information updates immediately
- **Minimal UI Changes**: Kept existing layout and design intact

### Technical Details
- Streak data is fetched from MongoDB database
- Auto-visit recording prevents duplicate daily visits
- Proper error handling for network issues
- Loading states for better user experience
- **No breaking changes** to existing functionality or layout
- **No new sections added** - worked within existing structure

### UI/UX Approach
- **Conservative Design**: Kept existing layout exactly as is
- **Minimal Changes**: Only updated the streak number in existing stat card
- **Loading States**: Added loading indicator without changing layout
- **No New Components**: Used existing stat card structure
- **Preserved Design**: Maintained all existing animations and styling

### Fixes Applied
- **Bio Field**: Confirmed bio field exists in schema and is properly linked via `userProfile?.profile?.bio`
- **Streak Showcase**: Fixed demo "12 day streak" to show real streak data from database
- **Database Migration**: Created migration script to add zemon streak fields to existing users
- **TypeScript Interface**: Updated UserProfile interface to include zemon streak fields
- **Real-time Updates**: Streak data now updates in both stat card and showcase section

### Database Migration
- **File**: `backend/src/scripts/addZemonStreakFields.js` (NEW)
  - Migration script to add zemon streak fields to existing users
  - Adds `zemonStreak`, `longestZemonStreak`, and `lastZemonVisit` fields
  - Sets default values for existing users
  - Safe migration with error handling

### Streak Logic Fixes
- **File**: `backend/src/services/zemonStreak.service.ts` (UPDATED)
  - Fixed `getStreakInfo` function to ensure users who visited today have at least 1 streak
  - Added logic: if user visited today and streak is 0, set streak to 1
  - Improved streak calculation accuracy

- **File**: `frontend/src/hooks/useZemonStreak.ts` (UPDATED)
  - Fixed useEffect dependency issue that was causing race conditions
  - Separated fetch and visit recording into two separate effects
  - Improved reliability of automatic visit recording

- **File**: `backend/src/scripts/checkZemonStreakFields.js` (NEW)
  - Diagnostic script to check current state of zemon streak fields
  - Can identify and fix users with missing fields
  - Provides detailed logging of field status

## Phase 5: Settings Page Database Integration

### Backend API Enhancements
- **File**: `backend/src/controllers/user.controller.ts` (UPDATED)
  - Added `changePasswordController` - Password change functionality
  - Added `updateSkillsController` - Skills management
  - Added `deleteAccountController` - Account deletion
  - Added `exportUserDataController` - Data export functionality
  - Proper validation and error handling for all endpoints

- **File**: `backend/src/api/user.routes.ts` (UPDATED)
  - Added `PATCH /api/users/me/password` - Change password
  - Added `PATCH /api/users/me/skills` - Update skills
  - Added `DELETE /api/users/me` - Delete account
  - Added `GET /api/users/me/export` - Export user data

### Frontend Settings API Service
- **File**: `frontend/src/lib/settingsApi.ts` (NEW)
  - Complete API service for settings functionality
  - Profile updates, password changes, skills management
  - Account deletion and data export
  - Proper error handling and TypeScript interfaces

### Settings Page Integration
- **File**: `frontend/src/pages/SettingsPage.tsx` (UPDATED)
  - **Profile Section**: Fully integrated with database
    - Loads real user data from database
    - Saves profile changes to database
    - Real-time validation and error handling
    - Profile completion percentage calculation
  - **Skills Management**: Dynamic skills management
    - Add/remove skills with real-time updates
    - Skills validation and auto-save
    - Visual skill tags with remove functionality
  - **College Details**: Complete college information
    - College name, course, branch, year
    - City and state information
    - Integrated with profile save functionality
  - **Account Section**: Enhanced account management
    - Password change with strength validation
    - Data export functionality
    - Account deletion with confirmation
    - Session management display
  - **Loading States**: Proper loading indicators
    - Profile loading spinner
    - Save operation feedback
    - Error handling with toast notifications

### Features Implemented
- **Real-time Data Loading**: All settings load from database
- **Profile Updates**: Complete profile information management
- **Skills Management**: Dynamic add/remove skills functionality
- **College Details**: Full college information management
- **Password Management**: Secure password change with validation
- **Data Export**: Complete user data export functionality
- **Account Deletion**: Secure account deletion with confirmation
- **Error Handling**: Comprehensive error handling and user feedback
- **Loading States**: Proper loading indicators throughout
- **Form Validation**: Real-time validation for all inputs

### Technical Details
- All API endpoints properly authenticated
- Database operations with proper error handling
- Real-time form validation and feedback
- Responsive design maintained
- TypeScript interfaces for type safety
- Proper state management and data flow
- Toast notifications for user feedback
- Loading states for better UX

### Account Section Improvements
- **Phone Number**: Removed phone number field from account section
- **Email Verification**: Now shows real verification status from Clerk
  - Green checkmark for verified emails
  - Yellow warning for unverified emails
  - Verify button disabled for already verified emails
- **Active Sessions**: Now uses real session data from Clerk
  - Shows actual device types and locations
  - Displays real last active timestamps
  - Current session highlighted properly
  - Logout buttons for other sessions
- **Connected Accounts**: Grayed out with "Coming Soon" badges
  - GitHub and Google integration disabled
  - Visual indication that features are in development
  - Proper disabled styling and cursor states

### Social Links Fix
- **File**: `frontend/src/hooks/useUserProfile.ts` (UPDATED)
  - Fixed social links redirecting to `domain/social-link` instead of actual URLs
  - Added `ensureProtocol` helper function to automatically add `https://` to URLs
  - URLs without protocol now properly redirect to external social media sites
  - Added safety checks in ProfilePage for additional URL validation
  - Added tooltips and better accessibility for social link buttons 