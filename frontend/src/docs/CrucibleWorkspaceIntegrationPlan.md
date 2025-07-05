# Crucible Workspace Integration Plan

## Current State Analysis

### Components Available
1. **Core Components**
   - `CrucibleWorkspaceView`: Main container for the workspace
   - `SolutionEditor`: Rich text editor using TipTap
   - `ProblemDetailsSidebar`: Shows problem information
   - `AIChatSidebar`: AI assistance panel

2. **Unused Components**
   - `NotesCollector`: For taking and managing notes with auto-tagging
   - `WorkspaceModeSelector`: For switching between workspace modes (understand, brainstorm, draft, review)
   - `BulletEditor`: For structured bullet-point notes (has type issues)

3. **Context & State Management**
   - `WorkspaceContext`: Manages workspace state (mode, notes, word count)
   - Custom events for toggling UI elements

### Current UI Issues
1. Navigation buttons in AppLayout work inconsistently
2. Problem details sidebar is not properly integrated
3. We're not using the workspace modes feature
4. Notes functionality is implemented but not integrated
5. Missing integration between components (e.g., notes collector and workspace)

## Integration Plan

### 1. Workspace Layout Redesign

#### Main Layout Structure
```
+------------------------------------------+
| AppLayout (Nav + Sidebar)                |
+------------------------------------------+
| CrucibleWorkspaceView                    |
| +----------------+---------------------+ |
| | ProblemDetails | Main Content Area   | |
| | Sidebar        | +---------------+   | |
| |                | | WorkspaceMode |   | |
| |                | | Selector      |   | |
| |                | +---------------+   | |
| |                | | SolutionEditor|   | |
| |                | | or            |   | |
| |                | | NotesCollector|   | |
| |                | +---------------+   | |
| +----------------+---------------------+ |
|                    | AIChatSidebar      ||
|                    +--------------------+|
+------------------------------------------+
```

### 2. Component Integration

#### A. Main Navigation (AppLayout.tsx)
- Keep existing buttons: Back to Crucible, Problem Details, AI Chat, Solution Editor, Full View
- Add "Mode" button to toggle WorkspaceModeSelector visibility
- Add "Notes" button to toggle between SolutionEditor and NotesCollector

#### B. CrucibleWorkspaceView.tsx
- Maintain the three-panel layout: ProblemDetailsSidebar, Main Content, AIChatSidebar
- Add state for tracking active content (solution or notes)
- Add WorkspaceModeSelector at the top of the main content area
- Conditionally render SolutionEditor or NotesCollector based on active content

#### C. WorkspaceContext.tsx
- Add state for tracking active content type (solution/notes)
- Add toggle function for switching between content types
- Connect mode changes to appropriate UI updates

### 3. Implementation Steps

1. **Update WorkspaceContext**
   - Add `activeContent` state ('solution' | 'notes')
   - Add `setActiveContent` function
   - Add event handlers for content switching

2. **Update CrucibleWorkspaceView**
   - Add WorkspaceModeSelector to the top of the main content
   - Implement conditional rendering for SolutionEditor/NotesCollector
   - Add event listeners for content switching

3. **Update AppLayout**
   - Add new navigation buttons for Mode and Notes
   - Implement event dispatchers for new buttons

4. **Integrate NotesCollector**
   - Connect to WorkspaceContext for notes state
   - Ensure proper styling to match SolutionEditor

5. **Fix BulletEditor Type Issues**
   - Address undefined checks in BulletEditor
   - Add proper type safety

### 4. Event System Standardization

Define a standard set of events for UI manipulation:
- `toggle-problem-sidebar`: Toggle problem details visibility
- `toggle-chat-sidebar`: Toggle AI chat visibility
- `toggle-solution-editor`: Toggle solution editor visibility
- `toggle-notes-collector`: Toggle notes collector visibility
- `toggle-workspace-mode`: Toggle workspace mode selector visibility
- `switch-content`: Switch between solution and notes (with detail payload)
- `toggle-problem-fullview`: Toggle full view mode

### 5. User Experience Flow

1. **Problem Understanding Flow**
   - User opens problem
   - WorkspaceMode defaults to "understand"
   - ProblemDetailsSidebar is open by default
   - User can take notes using NotesCollector
   - User can ask AI for clarification

2. **Solution Development Flow**
   - User switches to "brainstorm" mode
   - User can toggle between notes and solution
   - User drafts solution in SolutionEditor
   - User can reference notes taken earlier
   - AI provides assistance as needed

3. **Review Flow**
   - User switches to "review" mode
   - Solution is displayed with review tools
   - User can make final edits before submission

## Implementation Priorities

1. **High Priority**
   - Fix navigation buttons in AppLayout
   - Integrate WorkspaceModeSelector
   - Add content switching between SolutionEditor and NotesCollector

2. **Medium Priority**
   - Improve event system for UI manipulation
   - Fix BulletEditor type issues
   - Add keyboard shortcuts for common actions

3. **Low Priority**
   - Add animations for transitions
   - Implement auto-save functionality
   - Add progress tracking across modes

## Technical Considerations

1. **State Management**
   - Use WorkspaceContext for global state
   - Use local state for UI-specific concerns
   - Use custom events for cross-component communication

2. **Performance**
   - Lazy load components when possible
   - Optimize re-renders with memoization
   - Consider code splitting for large components

3. **Accessibility**
   - Ensure keyboard navigation works
   - Add proper ARIA attributes
   - Test with screen readers

## Next Steps

1. Update WorkspaceContext with new state and functions
2. Implement WorkspaceModeSelector integration
3. Add content switching between SolutionEditor and NotesCollector
4. Update AppLayout navigation buttons
5. Test and refine the integration 