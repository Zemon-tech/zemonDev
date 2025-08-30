# CrucibleProblem Requirements Structure Update Plan

## Overview
This document outlines the comprehensive plan to update the CrucibleProblem model from simple string arrays for functional and non-functional requirements to a more structured format that includes context for each requirement.

## Current vs. New Structure

### Current Structure
```typescript
requirements: {
  functional: string[];
  nonFunctional: string[];
}
```

### New Structure
```typescript
interface IRequirement {
  requirement: string;
  context: string;
}

requirements: {
  functional: IRequirement[];
  nonFunctional: IRequirement[];
}
```

## Phase-wise Implementation Plan

### **PHASE 1: Backend Type Definitions & Interfaces (Foundation)**

#### 1.1 Update Frontend Type Definitions
- **File:** `frontend/src/lib/crucibleApi.ts`
- **Action:** Modify `ICrucibleProblem` interface to use new requirements structure
- **Priority:** High - Foundation for all other changes

#### 1.2 Update Backend Service Layer
- **Files:** 
  - `backend/src/services/ai.service.ts` - Update all `.join()` operations on requirements
  - `backend/src/services/solutionAnalysis.service.ts` - Update requirements handling
- **Action:** Modify services to handle new object structure instead of string arrays
- **Priority:** High - Core business logic

---

### **PHASE 2: Frontend Component Updates (Display Layer)**

#### 2.1 Update Problem Details Sidebar
- **File:** `frontend/src/components/crucible/ProblemDetailsSidebar.tsx`
- **Actions:**
  - Update the `normalizeRequirements` function to handle new structure
  - Update UI rendering to display both requirement text and context
  - Handle backward compatibility for existing data
- **Priority:** High - Main user interface component

#### 2.2 Update Other Frontend Components
- **Action:** Check and update any other components that display requirements
- **Action:** Update form components if they exist for creating/editing problems
- **Priority:** Medium - Secondary components

---

### **PHASE 3: Data Migration & Backward Compatibility**

#### 3.1 Update Seed Data & Scripts
- **File:** `backend/src/scripts/seed-crucible-problems.ts`
- **Action:** Modify to use new structure
- **Priority:** Medium - Development environment

#### 3.2 Database Migration Strategy
- **Action:** Create migration script to convert existing string arrays to new object structure
- **Action:** Handle existing data gracefully during transition
- **Priority:** High - Production data integrity

---

### **PHASE 4: API & Controller Updates**

#### 4.1 Update Controllers
- **Action:** Modify any controllers that create/update CrucibleProblem instances
- **Action:** Ensure proper validation of new requirements structure
- **Action:** Update any admin controllers that manage problems
- **Priority:** High - API consistency

#### 4.2 Update API Endpoints
- **Action:** Ensure all POST/PUT endpoints handle new requirements format
- **Action:** Update any bulk operations or import/export functionality
- **Priority:** High - API functionality

---

### **PHASE 5: Testing & Validation**

#### 5.1 Comprehensive Testing
- **Action:** Test all updated components with new data structure
- **Action:** Test backward compatibility with existing data
- **Action:** Validate API endpoints work correctly
- **Action:** Test UI rendering in different scenarios
- **Priority:** High - Quality assurance

---

### **PHASE 6: Documentation & Cleanup**

#### 6.1 Update Documentation
- **Files:**
  - `docs/DYNAMIC_CONTENT_REFERENCE.md`
  - `project-context/*.json` files
- **Action:** Update all references to reflect new structure
- **Priority:** Medium - Long-term maintainability

#### 6.2 Code Cleanup
- **Action:** Remove any deprecated code
- **Action:** Ensure consistent usage patterns across codebase
- **Priority:** Low - Code quality

---

## Key Challenges Identified

### 1. Multiple `.join()` Operations
- **Location:** AI services that expect string arrays
- **Impact:** High - Core functionality may break
- **Solution:** Update all services to extract requirement text before joining

### 2. Frontend Normalization Function
- **Location:** `ProblemDetailsSidebar.tsx`
- **Impact:** Medium - Display may break
- **Solution:** Handle both old and new formats gracefully

### 3. Seed Data Compatibility
- **Location:** `seed-crucible-problems.ts`
- **Impact:** Medium - Development environment
- **Solution:** Update all seed data to new format

### 4. Type Definition Synchronization
- **Location:** Frontend and backend interfaces
- **Impact:** High - Type safety
- **Solution:** Ensure consistent updates across all files

### 5. Backward Compatibility
- **Location:** Production data
- **Impact:** High - User experience
- **Solution:** Implement migration strategy and fallback handling

---

## Risk Mitigation Strategies

### Phase 1: Foundation
- Ensures type safety before making changes
- Prevents runtime errors during development

### Phase 2: Display Layer
- Focuses on UI without breaking core functionality
- Allows incremental testing of changes

### Phase 3: Data Migration
- Handles data transformation safely
- Maintains data integrity during transition

### Phase 4: API Consistency
- Ensures all endpoints work with new structure
- Maintains API contract stability

### Phase 5: Validation
- Comprehensive testing ensures all changes work together
- Catches integration issues early

### Phase 6: Maintenance
- Ensures long-term code maintainability
- Provides clear documentation for future developers

---

## Success Criteria

### Functional Requirements
- [ ] All requirements display with both text and context
- [ ] Backward compatibility maintained for existing data
- [ ] New problems can be created with context
- [ ] All API endpoints work correctly

### Technical Requirements
- [ ] Type safety maintained across frontend and backend
- [ ] No breaking changes to existing functionality
- [ ] Performance not degraded
- [ ] Code follows existing patterns

### User Experience
- [ ] Requirements are more informative and clear
- [ ] No data loss during transition
- [ ] UI remains responsive and intuitive
- [ ] Error handling is graceful

---

## Timeline Estimate

- **Phase 1:** 1-2 days (Foundation)
- **Phase 2:** 2-3 days (UI Components)
- **Phase 3:** 1-2 days (Data Migration)
- **Phase 4:** 1-2 days (API Updates)
- **Phase 5:** 2-3 days (Testing)
- **Phase 6:** 1 day (Documentation)

**Total Estimated Time:** 8-13 days

---

## Dependencies

- Backend model changes must be completed before frontend updates
- Type definitions must be synchronized between frontend and backend
- Testing environment must have sample data in both old and new formats
- All team members must be aware of the changes to prevent conflicts

---

## Rollback Plan

If issues arise during implementation:
1. Revert to previous commit
2. Restore database from backup if data migration was performed
3. Ensure all services are using previous data structure
4. Test thoroughly before attempting changes again

---

*This plan should be reviewed and approved by the development team before implementation begins.*
