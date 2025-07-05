flowchart TD
    subgraph "AppLayout"
        Nav["Navigation Bar<br/>- Back to Crucible<br/>- Problem Details<br/>- AI Chat<br/>- Solution/Notes<br/>- Workspace Mode<br/>- Full View"]
    end
    
    subgraph "CrucibleWorkspaceView"
        PDS["Problem Details<br/>Sidebar"]
        MCA["Main Content Area"]
        ACS["AI Chat<br/>Sidebar"]
        
        subgraph "Main Content Area"
            WMS["Workspace Mode Selector<br/>(understand, brainstorm, draft, review)"]
            Content["Content Area"]
            
            subgraph "Content Area (Toggle)"
                SE["Solution Editor<br/>(TipTap Rich Text)"]
                NC["Notes Collector<br/>(Auto-tagging notes)"]
            end
        end
    end
    
    Nav --> PDS
    Nav --> MCA
    Nav --> ACS
    
    WMS --> Content
    
    classDef layout fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef component fill:#d4f1f9,stroke:#333,stroke-width:1px;
    classDef toggle fill:#ffe6cc,stroke:#333,stroke-width:1px;
    
    class AppLayout,CrucibleWorkspaceView layout;
    class PDS,MCA,ACS,WMS,Content component;
    class SE,NC toggle;




flowchart TD
    subgraph "AppLayout"
        Nav["Navigation Bar<br/>- Back to Crucible<br/>- Problem Details<br/>- AI Chat<br/>- Solution/Notes<br/>- Workspace Mode<br/>- Full View"]
    end
    
    subgraph "CrucibleWorkspaceView"
        PDS["Problem Details<br/>Sidebar"]
        MCA["Main Content Area"]
        ACS["AI Chat<br/>Sidebar"]
        
        subgraph "Main Content Area"
            WMS["Workspace Mode Selector<br/>(understand, brainstorm, draft, review)"]
            Content["Content Area"]
            
            subgraph "Content Area (Toggle)"
                SE["Solution Editor<br/>(TipTap Rich Text)"]
                NC["Notes Collector<br/>(Auto-tagging notes)"]
            end
        end
    end
    
    Nav --> PDS
    Nav --> MCA
    Nav --> ACS
    
    WMS --> Content
    
    classDef layout fill:#f9f9f9,stroke:#333,stroke-width:1px;
    classDef component fill:#d4f1f9,stroke:#333,stroke-width:1px;
    classDef toggle fill:#ffe6cc,stroke:#333,stroke-width:1px;
    
    class AppLayout,CrucibleWorkspaceView layout;
    class PDS,MCA,ACS,WMS,Content component;
    class SE,NC toggle;







flowchart TD
    subgraph "WorkspaceContext"
        WS_State["State<br/>- currentMode<br/>- notes[]<br/>- wordCount<br/>- activeContent<br/>- UI visibility flags"]
        WS_Methods["Methods<br/>- setMode()<br/>- addNote()<br/>- removeNote()<br/>- setActiveContent()<br/>- toggle functions"]
    end
    
    subgraph "Event System"
        E1["toggle-problem-sidebar"]
        E2["toggle-chat-sidebar"]
        E3["toggle-solution-editor"]
        E4["toggle-notes-collector"]
        E5["toggle-workspace-mode"]
        E6["switch-content"]
        E7["toggle-problem-fullview"]
    end
    
    subgraph "Components"
        AL["AppLayout<br/>(dispatches events)"]
        CWV["CrucibleWorkspaceView<br/>(listens for events)"]
        SE["SolutionEditor"]
        NC["NotesCollector"]
        WMS["WorkspaceModeSelector"]
        PDS["ProblemDetailsSidebar"]
        ACS["AIChatSidebar"]
    end
    
    AL --> E1 & E2 & E3 & E4 & E5 & E6 & E7
    E1 & E2 & E3 & E4 & E5 & E6 & E7 --> CWV
    
    WS_State --> CWV
    CWV --> WS_Methods
    
    CWV --> SE & NC & WMS & PDS & ACS
    
    classDef context fill:#d5e8d4,stroke:#82b366,stroke-width:1px;
    classDef events fill:#fff2cc,stroke:#d6b656,stroke-width:1px;
    classDef components fill:#dae8fc,stroke:#6c8ebf,stroke-width:1px;
    
    class WS_State,WS_Methods context;
    class E1,E2,E3,E4,E5,E6,E7 events;
    class AL,CWV,SE,NC,WMS,PDS,ACS components;


flowchart LR
    Start["User opens problem"] --> Understand
    
    subgraph "Workspace Modes"
        Understand["1. Understand<br/>- Read problem details<br/>- Take initial notes<br/>- Clarify with AI"]
        Brainstorm["2. Brainstorm<br/>- Generate ideas<br/>- Explore solutions<br/>- Outline approach"]
        Draft["3. Draft<br/>- Write full solution<br/>- Implement details<br/>- Refine approach"]
        Review["4. Review<br/>- Check requirements<br/>- Optimize solution<br/>- Final edits"]
    end
    
    Understand --> Brainstorm
    Brainstorm --> Draft
    Draft --> Review
    Review --> Submit["Submit Solution"]
    
    subgraph "Content Types (Available in all modes)"
        Solution["Solution Editor<br/>- Rich text editor<br/>- Code blocks<br/>- Diagrams"]
        Notes["Notes Collector<br/>- Auto-tagged notes<br/>- Quick thoughts<br/>- Reference material"]
    end
    
    Understand -.-> Notes
    Brainstorm -.-> Notes
    Brainstorm -.-> Solution
    Draft -.-> Solution
    Draft -.-> Notes
    Review -.-> Solution
    
    classDef mode fill:#d5e8d4,stroke:#82b366,stroke-width:1px;
    classDef content fill:#dae8fc,stroke:#6c8ebf,stroke-width:1px;
    classDef action fill:#ffe6cc,stroke:#d79b00,stroke-width:1px;
    
    class Understand,Brainstorm,Draft,Review mode;
    class Solution,Notes content;
    class Start,Submit action;