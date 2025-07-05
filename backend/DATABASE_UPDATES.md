# Crucible Database Schema Updates

This document outlines the database schema updates required to fully support the Crucible problem-solving platform.

## Current Schema

Our MongoDB database currently has the following collections:

1. **Users**
   - Basic user information
   - Stats (problems solved, resources created)
   - References to completed solutions

2. **CrucibleProblems**
   - Problem details (title, description, difficulty)
   - Requirements and constraints
   - Metrics (attempts, solutions)

3. **CrucibleSolutions**
   - Final submitted solutions
   - References to problems and users
   - AI analysis and peer reviews

## New Collections to Add

### 1. SolutionDrafts

Stores in-progress solution drafts with version history.

```typescript
interface ISolutionDraft {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  currentContent: string;       // Current draft content
  versions: [{                  // Version history
    content: string;
    timestamp: Date;
    description: string;        // Optional user comment about this version
  }];
  status: 'active' | 'archived'; // Whether this draft is active or archived after submission
  lastEdited: Date;
  autoSaveEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. CrucibleNotes

Stores user notes related to problems.

```typescript
interface ICrucibleNote {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  content: string;              // Rich text/HTML content of the notes
  tags: string[];               // User-defined tags for organization
  status: 'active' | 'archived'; // Whether these notes are active or archived
  visibility: 'private' | 'public'; // Whether notes are shareable
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. AIChatHistory

Stores AI conversations related to problem-solving.

```typescript
interface IAIChatHistory {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  title: string;                // User-defined title for the chat
  messages: [{                  // Array of chat messages
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }];
  status: 'active' | 'archived'; // Whether this chat is active or archived
  createdAt: Date;
  updatedAt: Date;
}
```

### 4. WorkspaceState

Stores user workspace configuration and state.

```typescript
interface IWorkspaceState {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  activeMode: 'solution' | 'notes' | 'diagram' | 'research'; // Current workspace mode
  layout: {
    showProblemSidebar: boolean;
    showChatSidebar: boolean;
    sidebarWidths: {
      problem: number;
      chat: number;
    };
  };
  editorSettings: {
    fontSize: number;
    theme: string;
    wordWrap: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}
```

### 5. CrucibleDiagrams

Stores diagrams and visual aids created during problem-solving.

```typescript
interface ICrucibleDiagram {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  title: string;
  type: 'architecture' | 'flowchart' | 'er-diagram' | 'sequence' | 'other';
  content: string;              // Could be SVG, JSON representation, or Mermaid syntax
  thumbnail: string;            // Base64 or URL to thumbnail image
  status: 'active' | 'archived'; // Whether this diagram is active or archived
  createdAt: Date;
  updatedAt: Date;
}
```

### 6. ProgressTracking

Tracks user progress on problems.

```typescript
interface IProgressTracking {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  timeSpent: number;            // Time spent in minutes
  milestones: [{
    id: string;
    description: string;
    completed: boolean;
    completedAt?: Date;
  }];
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### 7. ResearchItems

Stores research materials and references.

```typescript
interface IResearchItem {
  userId: ObjectId;             // Reference to User
  problemId: ObjectId;          // Reference to CrucibleProblem
  title: string;
  type: 'article' | 'code-snippet' | 'documentation' | 'video' | 'other';
  content: string;              // Could be text, code, or URL
  notes: string;                // User notes about this reference
  tags: string[];
  status: 'active' | 'archived'; // Whether this item is active or archived
  createdAt: Date;
  updatedAt: Date;
}
```

## Updates to Existing Collections

### CrucibleProblem Updates

Add the following fields to enhance problem descriptions:

```typescript
{
  // Existing fields...
  
  // New fields
  estimatedTime: Number,        // Estimated time in minutes
  learningObjectives: [String], // What users will learn
  prerequisites: [{
    name: String,
    link: String               // Link to related Forge resource
  }],
  userPersona: {
    name: String,
    journey: String            // User journey description
  },
  dataAssumptions: [String],    // Data and scale assumptions
  edgeCases: [String],          // Common pitfalls and edge cases
  relatedResources: [{
    title: String,
    link: String               // Link to related Forge article
  }],
  subtasks: [String],           // Milestones/steps to solve the problem
  communityTips: [{
    content: String,
    author: String             // Author of the tip
  }],
  aiPrompts: [String]           // Suggested AI prompts
}
```

### User Updates

Add the following fields to track user progress:

```typescript
{
  // Existing fields...
  
  // New fields
  activeDrafts: [ObjectId],     // References to active solution drafts
  archivedDrafts: [ObjectId],   // References to archived solution drafts
  workspacePreferences: {
    defaultEditorSettings: {
      fontSize: Number,
      theme: String,
      wordWrap: Boolean
    },
    defaultLayout: {
      showProblemSidebar: Boolean,
      showChatSidebar: Boolean
    }
  }
}
```

## Implementation Plan

1. Create models for new collections
2. Update existing models with new fields
3. Create controllers for CRUD operations on new collections
4. Update existing controllers to handle new fields
5. Create API routes for new endpoints
6. Update frontend to use new endpoints

## Migration Strategy

1. Create new collections without disrupting existing data
2. Add new fields to existing collections with default values
3. Backfill data where possible
4. Update application code to use new schema
5. Monitor for any issues during rollout

## Data Lifecycle Management

- Active data: Readily available in the UI
- Archived data: Stored but not shown by default
- Data retention: Consider policies for long-term storage

## Security Considerations

- Ensure proper access control for all new collections
- Validate input for all new fields
- Consider data privacy implications for shared/public content 