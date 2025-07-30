# Crucible Implementation Plan

This document outlines the implementation plan for the Crucible problem-solving platform, focusing on data storage, API endpoints, and frontend integration.

## Database Schema

We've updated our MongoDB database with the following collections:

1. **CrucibleProblems**: Enhanced with additional fields for learning objectives, prerequisites, user personas, etc.
2. **CrucibleSolutions**: Stores final submitted solutions
3. **SolutionDrafts**: Stores in-progress solutions with version history
4. **CrucibleNotes**: Stores user notes related to problems
5. **AIChatHistory**: Stores AI conversations related to problem-solving
6. **WorkspaceState**: Stores user workspace configuration and state
7. **CrucibleDiagrams**: Stores diagrams and visual aids
8. **ProgressTracking**: Tracks user progress on problems
9. **ResearchItems**: Stores research materials and references

## API Endpoints

### Problem Management

- `GET /api/crucible`: Get all challenges with filtering options
- `GET /api/crucible/:id`: Get a single challenge by ID

### Solution Management

- `GET /api/crucible/:challengeId/solutions`: Get all solutions for a challenge
- `POST /api/crucible/:challengeId/solutions`: Submit a solution for a challenge

### Draft Management

- `GET /api/crucible/:problemId/draft`: Get or create a solution draft
- `PUT /api/crucible/:problemId/draft`: Update a solution draft
- `PUT /api/crucible/:problemId/draft/archive`: Archive a solution draft
- `GET /api/crucible/:problemId/draft/versions`: Get all versions of a draft

### Notes Management (To Be Implemented)

- `GET /api/crucible/:problemId/notes`: Get notes for a problem
- `POST /api/crucible/:problemId/notes`: Create notes for a problem
- `PUT /api/crucible/:problemId/notes`: Update notes for a problem
- `DELETE /api/crucible/:problemId/notes`: Delete notes for a problem

### AI Chat Management (To Be Implemented)

- `GET /api/crucible/:problemId/chats`: Get all chat sessions for a problem
- `POST /api/crucible/:problemId/chats`: Create a new chat session
- `GET /api/crucible/:problemId/chats/:chatId`: Get a specific chat session
- `POST /api/crucible/:problemId/chats/:chatId/messages`: Add a message to a chat session

### Workspace State Management (To Be Implemented)

- `GET /api/crucible/:problemId/workspace`: Get workspace state for a problem
- `PUT /api/crucible/:problemId/workspace`: Update workspace state for a problem

### Diagram Management (To Be Implemented)

- `GET /api/crucible/:problemId/diagrams`: Get all diagrams for a problem
- `POST /api/crucible/:problemId/diagrams`: Create a new diagram
- `PUT /api/crucible/:problemId/diagrams/:diagramId`: Update a diagram
- `DELETE /api/crucible/:problemId/diagrams/:diagramId`: Delete a diagram

### Progress Tracking (To Be Implemented)

- `GET /api/crucible/:problemId/progress`: Get progress for a problem
- `PUT /api/crucible/:problemId/progress`: Update progress for a problem
- `PUT /api/crucible/:problemId/progress/milestones/:milestoneId`: Update a specific milestone

### Research Items (To Be Implemented)

- `GET /api/crucible/:problemId/research`: Get all research items for a problem
- `POST /api/crucible/:problemId/research`: Create a new research item
- `PUT /api/crucible/:problemId/research/:itemId`: Update a research item
- `DELETE /api/crucible/:problemId/research/:itemId`: Delete a research item

## Crucible Result Page & Submission Workflow Updates

### Solution Editor Access Control
- After a user submits a solution for a problem, the solution editor should no longer be visible or accessible for that problem instance.
- This restriction applies to all users.
- If the user revisits the problem page, they should always see the analysis/result page for their latest submission, not the solution editor.
- The UI must check the submission state (e.g., if a final solution exists for the user/problem) and conditionally render the editor or result page.

### Fetching Latest Analysis
- The backend should provide a way to fetch the latest analysis/result for a given user/problem combination.
- Update or clarify the API:
  - Add: `GET /api/crucible/:problemId/solutions/latest` (returns the latest solution/analysis for the current user)
  - Or update `GET /api/crucible/:challengeId/solutions` to support a `?user=current` and `?latest=true` query param.
- When a user visits a problem after submitting, they should always see the latest analysis/result page.

### Archiving Drafts on Submission
- When a user submits a solution, the current draft should be archived (already in plan).
- Ensure the draft is not editable after submission unless reattempted.

### Reattempt Workflow
- Add a 'Reattempt' button to the result page.
- When clicked:
  - A new draft is created for the user/problem.
  - The solution editor becomes visible and editable again.
  - User can submit a new solution for analysis (repeatable process).
- Previous submissions are always preserved as history; reattempts do not overwrite past submissions.

### News/History Section for Past Analyses
- Add a section to the result page listing all past analyses/submissions for the user/problem ("news" or "history").
- This section appears at the end of the result page.
- Each entry should be clickable; clicking navigates to the result/analysis page for that specific submission.
- There is no admin-specific history or admin functionality at this time.

### API Endpoints (Additions/Clarifications)
- `GET /api/crucible/:problemId/solutions/latest` — Get latest solution/analysis for current user/problem
- `GET /api/crucible/:problemId/solutions/history` — Get all past solutions/analyses for current user/problem
- `POST /api/crucible/:problemId/draft/reattempt` — Create a new draft for reattempting a problem

## Frontend Integration

### Workspace Context

Update the WorkspaceContext to manage:

1. Solution drafts with auto-save functionality
2. Notes collection and persistence
3. AI chat history and interactions
4. Workspace state (sidebar visibility, active mode)
5. Progress tracking

```typescript
// Example WorkspaceContext update
interface WorkspaceContextType {
  // Existing properties
  activeContent: 'solution' | 'notes';
  wordCount: number;
  isWorkspaceModeVisible: boolean;
  currentMode: string;
  
  // New properties
  draft: {
    content: string;
    lastSaved: Date;
    versions: { id: string; timestamp: Date; description: string }[];
    isDirty: boolean;
  };
  notes: {
    content: string;
    lastSaved: Date;
    isDirty: boolean;
  };
  aiChat: {
    messages: { role: 'user' | 'assistant'; content: string; timestamp: Date }[];
    isLoading: boolean;
  };
  layout: {
    showProblemSidebar: boolean;
    showChatSidebar: boolean;
    sidebarWidths: {
      problem: number;
      chat: number;
    };
  };
  progress: {
    timeSpent: number;
    milestones: { id: string; description: string; completed: boolean }[];
    status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  };
  
  // Methods
  saveDraft: () => Promise<void>;
  saveVersion: (description: string) => Promise<void>;
  saveNotes: () => Promise<void>;
  sendChatMessage: (message: string) => Promise<void>;
  toggleSidebar: (sidebar: 'problem' | 'chat') => void;
  updateProgress: (data: Partial<ProgressUpdate>) => Promise<void>;
  completeMilestone: (milestoneId: string) => Promise<void>;
}
```

### API Service

Create API service functions for interacting with the backend:

```typescript
// Example API service functions
const crucibleApi = {
  // Draft management
  getDraft: async (problemId: string) => {
    const response = await fetch(`/api/crucible/${problemId}/draft`);
    return response.json();
  },
  
  updateDraft: async (problemId: string, content: string, saveAsVersion = false, versionDescription = '') => {
    const response = await fetch(`/api/crucible/${problemId}/draft`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, saveAsVersion, versionDescription })
    });
    return response.json();
  },
  
  // Solution submission
  submitSolution: async (problemId: string, content: string) => {
    const response = await fetch(`/api/crucible/${problemId}/solutions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    return response.json();
  },
  
  // Other API functions for notes, chats, etc.
};
```

### Component Updates

1. **CrucibleWorkspaceView**:
   - Add auto-save functionality for drafts
   - Implement version history UI
   - Add progress tracking

2. **SolutionEditor**:
   - Connect to draft API for real-time saving
   - Add version control UI elements

3. **NotesCollector**:
   - Connect to notes API for persistence
   - Add formatting options

4. **AIChatSidebar**:
   - Connect to chat history API
   - Implement chat session management

5. **ProblemDetailsSidebar**:
   - Display enhanced problem details
   - Add interactive elements for prerequisites and resources

## Implementation Phases

### Phase 1: Core Data Storage (Current)

- ✅ Create database models
- ✅ Implement solution draft API endpoints
- ✅ Update solution submission to archive drafts

### Phase 2: API Expansion

- Implement endpoints for fetching latest and historical analyses per user/problem
- Implement endpoint for reattempt (new draft creation)
- Add controllers for each new model
- Create comprehensive tests

### Phase 3: Frontend Integration

- Update UI to enforce editor/result page access control
- Add reattempt and news/history features
- Update WorkspaceContext
- Implement API service functions
- Enhance components to use new APIs

### Phase 4: User Experience Enhancements

- Add version history UI
- Implement progress tracking visualization
- Create research collection interface

## Testing Strategy

1. Unit tests for all models and controllers
2. Integration tests for API endpoints
3. End-to-end tests for critical user flows:
   - Draft saving and version control
   - Solution submission
   - Notes and chat persistence

## Deployment Considerations

1. Database migration strategy
2. Backward compatibility for existing solutions
3. Performance monitoring for auto-save functionality
4. Security review for user data access 