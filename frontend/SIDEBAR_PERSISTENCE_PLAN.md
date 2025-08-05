# Sidebar State Persistence Implementation Plan

## Overview
This document outlines a robust phase-wise plan to implement sidebar state persistence in localStorage, similar to how the theme context is currently saved. The implementation will ensure that the sidebar state (open/closed) persists across browser sessions and page reloads.

## Current State Analysis

### Theme Context Storage (Reference Implementation)
The theme is currently saved in **localStorage** in the following locations:

1. **`frontend/src/lib/ThemeContext.tsx`** - Main theme context that:
   - Saves theme to `localStorage.setItem('theme', theme)` in the `applyTheme` function
   - Loads theme from `localStorage.getItem('theme')` on initialization
   - Handles system theme preference fallback

2. **`frontend/src/components/ui/ThemeSwitcher.tsx`** - Theme switcher component that:
   - Also saves theme to localStorage when changed: `localStorage.setItem("theme", newTheme)`

### Current Sidebar State Management
The sidebar state is currently managed in **`frontend/src/components/layout/AppLayout.tsx`** with:
```typescript
const [isSidebarOpen, setIsSidebarOpen] = useState(true);
```

This state is **not persisted** - it resets to `true` on every page reload.

## Phase-Wise Implementation Plan

### **Phase 1: Create SidebarContext and Provider**
**Objective**: Create a dedicated context for sidebar state management with localStorage persistence

**Tasks**:
1. Create `frontend/src/lib/SidebarContext.tsx` with:
   - Context interface for sidebar state
   - Provider component with localStorage integration
   - Custom hook for easy consumption
   - Default state handling and error boundaries

**Key Features**:
- localStorage persistence with fallback to default state
- TypeScript interfaces for type safety
- Error handling for localStorage access
- Debounced saves to prevent excessive writes

**Technical Details**:
```typescript
// State structure
interface SidebarState {
  isOpen: boolean;
  lastUpdated: number;
  version: string; // For future migrations
}

// localStorage key: 'zemon-sidebar-state'
// Debounce delay: 300ms
```

### **Phase 2: Integrate SidebarContext into App Structure**
**Objective**: Add SidebarProvider to the app's provider hierarchy

**Tasks**:
1. Update `frontend/src/App.tsx` to include SidebarProvider
2. Position it correctly in the provider hierarchy (after ThemeProvider, before WorkspaceProvider)
3. Ensure proper context isolation and performance

**Provider Hierarchy**:
```
ClerkProvider
  └── ThemeProvider
      └── SidebarProvider (NEW)
          └── ToastProvider
              └── Router
                  └── WorkspaceProvider
                      └── UserRoleProvider
                          └── AnalysisProvider
```

### **Phase 3: Refactor AppLayout to Use SidebarContext**
**Objective**: Replace local state with context-based state management

**Tasks**:
1. Update `frontend/src/components/layout/AppLayout.tsx`:
   - Remove local `isSidebarOpen` state
   - Import and use `useSidebar` hook
   - Update all sidebar-related functions to use context
   - Maintain existing functionality while adding persistence

2. Handle edge cases:
   - Auto-close behavior on problem pages
   - Focus mode integration
   - Mobile responsiveness

**Key Changes**:
```typescript
// Before
const [isSidebarOpen, setIsSidebarOpen] = useState(true);

// After
const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useSidebar();
```

### **Phase 4: Update Sidebar Component**
**Objective**: Ensure Sidebar component works seamlessly with new context

**Tasks**:
1. Update `frontend/src/components/layout/Sidebar.tsx`:
   - Verify prop interface compatibility
   - Ensure smooth transitions and animations
   - Test focus mode hover behavior

**Focus Areas**:
- Maintain existing prop interface
- Preserve animation smoothness
- Test focus mode hover interactions

### **Phase 5: Add Advanced Features**
**Objective**: Enhance the sidebar persistence with advanced features

**Tasks**:
1. **Per-page sidebar state**: Save different states for different pages
2. **User-specific settings**: Store sidebar state per user
3. **Migration system**: Handle localStorage schema updates
4. **Performance optimizations**: Debounced saves, lazy loading

**Advanced Features**:
```typescript
// Per-page state structure
interface PerPageSidebarState {
  [pagePath: string]: {
    isOpen: boolean;
    lastUpdated: number;
  }
}

// User-specific structure
interface UserSidebarState {
  [userId: string]: PerPageSidebarState;
}
```

### **Phase 6: Testing and Edge Cases**
**Objective**: Ensure robust functionality across all scenarios

**Tasks**:
1. Test localStorage access failures
2. Test browser compatibility
3. Test with different screen sizes
4. Test focus mode interactions
5. Test page navigation persistence

**Test Scenarios**:
- Private browsing mode
- localStorage disabled
- Different browsers (Chrome, Firefox, Safari, Edge)
- Mobile vs desktop
- Focus mode transitions
- Page navigation state persistence

### **Phase 7: Documentation and Cleanup**
**Objective**: Document the implementation and clean up any temporary code

**Tasks**:
1. Add JSDoc comments to new functions
2. Update any relevant documentation
3. Remove any temporary debugging code
4. Ensure consistent code style

## Technical Implementation Details

### **Key Design Decisions**:
1. **localStorage Key**: `'zemon-sidebar-state'` (namespaced to avoid conflicts)
2. **State Structure**: 
   ```typescript
   {
     isOpen: boolean;
     lastUpdated: number;
     version: string; // For future migrations
   }
   ```
3. **Error Handling**: Graceful fallback to default state if localStorage fails
4. **Performance**: Debounced saves (300ms delay) to prevent excessive writes

### **Migration Strategy**:
- Backward compatible with existing localStorage data
- Version-based migration system for future updates
- Clean migration from old state to new structure

### **Browser Compatibility**:
- Tested on Chrome, Firefox, Safari, Edge
- Handles private browsing mode gracefully
- Fallback for localStorage-disabled environments

## Implementation Checklist

### Phase 1: SidebarContext Creation
- [ ] Create `frontend/src/lib/SidebarContext.tsx`
- [ ] Implement context interface
- [ ] Add localStorage integration
- [ ] Create custom hook
- [ ] Add error handling
- [ ] Add debounced saves

### Phase 2: App Integration
- [ ] Update `frontend/src/App.tsx`
- [ ] Add SidebarProvider to hierarchy
- [ ] Test provider isolation
- [ ] Verify performance impact

### Phase 3: AppLayout Refactor
- [ ] Remove local sidebar state
- [ ] Import useSidebar hook
- [ ] Update toggle functions
- [ ] Handle edge cases
- [ ] Test auto-close behavior
- [ ] Test focus mode integration

### Phase 4: Sidebar Component
- [ ] Verify prop compatibility
- [ ] Test animations
- [ ] Test focus mode
- [ ] Test mobile responsiveness

### Phase 5: Advanced Features
- [ ] Implement per-page state
- [ ] Add user-specific settings
- [ ] Create migration system
- [ ] Optimize performance

### Phase 6: Testing
- [ ] Test localStorage failures
- [ ] Test browser compatibility
- [ ] Test screen sizes
- [ ] Test focus mode
- [ ] Test navigation persistence

### Phase 7: Documentation
- [ ] Add JSDoc comments
- [ ] Update documentation
- [ ] Clean up code
- [ ] Ensure code style consistency

## Success Criteria

1. **Persistence**: Sidebar state persists across browser sessions
2. **Performance**: No noticeable performance impact
3. **Compatibility**: Works across all supported browsers
4. **Reliability**: Graceful handling of localStorage failures
5. **User Experience**: Smooth transitions and animations maintained
6. **Focus Mode**: Existing focus mode functionality preserved
7. **Mobile**: Mobile responsiveness maintained

## Future Enhancements

1. **Per-page customization**: Different sidebar states for different pages
2. **User preferences**: User-specific sidebar settings
3. **Keyboard shortcuts**: Keyboard shortcuts for sidebar toggle
4. **Analytics**: Track sidebar usage patterns
5. **A/B testing**: Test different default sidebar states

## Risk Mitigation

1. **localStorage failures**: Graceful fallback to default state
2. **Performance impact**: Debounced saves and lazy loading
3. **Browser compatibility**: Extensive testing across browsers
4. **User experience**: Maintain existing smooth animations
5. **Focus mode conflicts**: Careful integration with existing focus mode

---

*This plan ensures a robust, maintainable, and user-friendly implementation of sidebar state persistence that follows the same patterns established by the theme context implementation.* 