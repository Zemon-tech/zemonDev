## Crucible Enhanced Submission Flow Implementation Plan

### Overview
This plan addresses the requirement to prevent multiple submissions, provide historical analysis access, and enable reattempt functionality while maintaining backward compatibility.

### Current Analysis
- **Backend**: Has SolutionAnalysis model with userId+problemId indexing, draft archiving endpoint
- **Frontend**: ResultPage exists but lacks reattempt/historical features
- **APIs**: Basic analysis retrieval, but missing user+problem specific queries

### Phase-wise Implementation Plan

#### Phase 1: Backend Infrastructure
**New API Endpoints:**
- `GET /api/crucible/:problemId/user-analysis` - Latest analysis for user+problem
- `GET /api/crucible/:problemId/user-analyses` - All analyses for user+problem  
- `POST /api/crucible/:problemId/reattempt` - Create new attempt

**Database Updates:**
- Add `attemptNumber` and `isLatest` fields to SolutionAnalysis
- Add compound indexes for performance
- Update submitSolution to auto-archive drafts

#### Phase 2: Frontend State Management
**New Hooks:**
- `useUserProblemStatus` - Check submission status
- `usePastAnalyses` - Historical analyses management
- `useReattempt` - Handle reattempt flow

**API Updates:**
- Add new methods to crucibleApi.ts for the new endpoints

#### Phase 3: UI Components 
**CrucibleProblemPage Changes:**
- Check for existing analysis on load
- Redirect to result page if already submitted
- Show appropriate messaging

**ResultPage Enhancements:**
- Add Reattempt button with confirmation
- Add Past Analysis section with timeline
- Update navigation flow

**New Components:**
- `PastAnalysesList` - Display historical analyses
- `ReattemptButton` - Handle reattempt flow
- `ProblemStatusBadge` - Show attempt status

#### Phase 4: Integration & Testing (2-3 days)
- Complete flow testing
- Edge case handling
- Performance optimization
- Error handling

### Technical Specifications

**Database Schema Extensions:**
```typescript
// Add to SolutionAnalysisSchema
attemptNumber: { type: Number, required: true, default: 1 }
isLatest: { type: Boolean, default: true }
```

**Key Features:**
- Single submission rule enforcement
- Automatic draft archiving on submission
- Historical analysis access
- Reattempt with new drafts
- Timeline visualization
- User-friendly navigation

**Security & Performance:**
- Proper access control and ownership validation
- Database indexing for optimal queries
- Caching strategy for frequent lookups
- Rate limiting for submissions

The plan is designed to be robust, scalable, and maintainable while ensuring no breaking changes to existing functionality. Each phase builds upon the previous one, allowing for incremental deployment and testing.