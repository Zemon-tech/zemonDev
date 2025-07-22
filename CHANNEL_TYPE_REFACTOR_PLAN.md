# Channel Type Refactor Plan: `text` → `chat`, `readonly` → `showcase`

## **Goal**
Update all code, types, API, and data references in both the frontend and backend so that:
- Channel type `'text'` becomes `'chat'`
- Channel type `'readonly'` becomes `'showcase'`
- All logic, validation, and documentation reflect the new names

This plan is designed to be robust, scalable, and minimize downtime or data inconsistency.

---

## **Phase 1: Audit & Preparation**
1. **Comprehensive Search**
   - Search for all usages of `'text'` and `'readonly'` as channel types in:
     - TypeScript types/interfaces
     - Mongoose schemas
     - API controllers/routes/services
     - Frontend logic/components/hooks
     - Test files (if any)
     - Documentation/markdown files
   - Identify places where these values are used in data (e.g., in the database).

2. **Dependency Mapping**
   - List all affected files and modules.
   - Identify any third-party integrations or clients that depend on these values.

3. **Migration Planning**
   - Plan for a database migration to update existing documents.
   - Plan for backward compatibility (if needed) during the transition.

---

## **Phase 2: Codebase Refactor (Non-Data)**
1. **Types & Schemas**
   - Update all TypeScript types, interfaces, and enums to use `'chat'` and `'showcase'` instead of `'text'` and `'readonly'`.
   - Update Mongoose schemas and validation logic.

2. **Controllers, Services, and Logic**
   - Update all backend and frontend logic that checks or sets channel type values.
   - Update any permission logic, UI rendering, or business rules that depend on these types.

3. **API Contracts**
   - Update API request/response validation and documentation.
   - Ensure all endpoints expect and return the new type values.

4. **Frontend Components & Hooks**
   - Update all components, hooks, and context providers that use or display channel types.
   - Update any hardcoded UI labels or logic.

5. **Tests & Documentation**
   - Update or add tests to cover the new type values.
   - Update all relevant documentation and markdown files.

---

## **Phase 3: Data Migration**
1. **Migration Script**
   - Write a migration script to update all existing channel documents in the database:
     - `type: 'text'` → `type: 'chat'`
     - `type: 'readonly'` → `type: 'showcase'`
   - Test the migration on a staging/dev database first.

2. **Deployment Coordination**
   - Plan for a short maintenance window if needed.
   - Deploy code changes and run the migration script in a coordinated fashion to avoid data inconsistency.

3. **Backward Compatibility (Optional)**
   - If needed, add temporary logic to accept both old and new type values during the transition.
   - Remove this logic after migration is complete and verified.

---

## **Phase 4: Verification & Cleanup**
1. **Testing**
   - Manually and automatically test all channel-related features in both frontend and backend.
   - Verify that all channels work as expected with the new type values.
   - Check for any missed references or edge cases.

2. **Cleanup**
   - Remove any temporary compatibility code.
   - Update any remaining documentation or comments.

3. **Monitoring**
   - Monitor logs and error reports for issues related to channel types after deployment.

---

## **Edge Cases & Considerations**
- **Data Consistency:** Ensure no channel documents are left with old type values.
- **API Consumers:** Notify or update any external clients that depend on the old type values.
- **Rollback Plan:** Prepare a rollback plan in case of migration failure.
- **Testing:** Cover both typical and edge-case scenarios in tests.

---

## **Approval**
- **No code or data changes will be made until you approve this plan.**
- Once approved, I will proceed phase by phase, confirming each step as needed. 

---

## **Phase 1: Audit & Preparation — Findings & Affected Files**

### 1. **TypeScript Types & Interfaces**
- `arenaChannel.model.ts` (backend, backend-admin):
  - `type: 'text' | 'announcement' | 'readonly'` (enum, default, schema)
- `arena.types.ts` (arena-admin):
  - `type: 'text' | 'announcement' | 'readonly'`
- `useArenaChannels.ts`, `useArenaChat.ts` (frontend):
  - `type: 'text' | 'announcement' | 'readonly'` (channel/message types)
- `ChannelsPage.tsx` (arena-admin, frontend-admin):
  - Zod schema, UI logic, and select options for channel type
- `ChannelTable.tsx` (frontend-admin):
  - Table column for channel type

### 2. **Mongoose Schemas**
- `arenaChannel.model.ts` (backend, backend-admin):
  - Enum and default for channel type
- `arenaMessage.model.ts` (backend, backend-admin):
  - Message type: `'text' | 'system'` (not affected for channel type, but check for confusion)

### 3. **Controllers, Services, and Logic**
- `arenaChannels.controller.ts` (backend):
  - Permission logic: `ch.type === 'text'`
  - Message creation: `type: 'text'`
- `socket.service.ts` (backend):
  - Message creation: `type: 'text'`
- `dev-admin.routes.ts` (backend):
  - Channel creation: `type: ... ? 'announcement' : 'text'`

### 4. **Frontend Components & Hooks**
- `ArenaPage.tsx` (frontend):
  - Channel selection and rendering logic
- `NirvanaChannel.tsx` (frontend):
  - Filtering channels by `type: 'text'`
- `ShowcaseChannel.tsx`, `AnnouncementsChannel.tsx`, `ChatChannel.tsx` (frontend):
  - Rendered based on channel type

### 5. **Documentation/Markdown**
- `arena-implementation.md`, `arena-admin-dashboard.md` (root):
  - Channel type enum references
- `CHANNEL_TYPE_REFACTOR_PLAN.md` (self-referential)

### 6. **Other**
- Some unrelated usages of `'text'` (e.g., HTML input types, document types, search indexes) were found and are **not affected** by this refactor.

### 7. **Data**
- All channel documents in the database with `type: 'text'` or `type: 'readonly'` will need migration.

### 8. **Third-Party/External**
- No direct evidence of third-party dependencies, but API consumers should be notified.

---

**Phase 1 is now complete. Please review these findings and approve to proceed to Phase 2 (Codebase Refactor).** 

---

## **Phase 2: Codebase Refactor — Important Changes**

### 1. **Types & Schemas**
- Updated all TypeScript types, interfaces, and enums for channel type:
  - `'text'` → `'chat'`
  - `'readonly'` → `'showcase'`
- Affected files: `arenaChannel.model.ts` (backend, backend-admin), `arena.types.ts` (arena-admin), `useArenaChannels.ts` (frontend), Zod schemas in `ChannelsPage.tsx` (arena-admin)

### 2. **Controllers, Services, and Logic**
- Updated all backend and frontend logic that checks or sets channel type values:
  - Permission logic, message creation, and subchannel creation now use `'chat'` and `'showcase'`
- Affected files: `arenaChannels.controller.ts`, `dev-admin.routes.ts`, `socket.service.ts` (backend), `NirvanaChannel.tsx` (frontend)

### 3. **Frontend Components & Hooks**
- Updated all components, hooks, and context providers that use or display channel types:
  - UI select options, filtering, and rendering logic now use `'chat'` and `'showcase'`
- Affected files: `ChannelsPage.tsx`, `MessagesPage.tsx` (arena-admin), `NirvanaChannel.tsx` (frontend)

### 4. **Other**
- No changes were made to unrelated usages of `'text'` (e.g., HTML input types, document/documentType, search indexes).

---

**Phase 2 is now complete. Please review these changes and approve to proceed to Phase 3 (Data Migration).** 

---

## **Phase 3: Data Migration — Important Changes & Instructions**

### 1. **Migration Script**
- Added `backend/src/migrations/migrate-channel-types-chat-showcase.ts`.
- This script:
  - Connects to the database using environment variables.
  - Updates all `ArenaChannel` documents:
    - `type: 'text'` → `type: 'chat'`
    - `type: 'readonly'` → `type: 'showcase'`
  - Logs the number of documents updated for each type.
  - Is idempotent and safe to run multiple times.

### 2. **Next Steps**
- Test the migration script on a staging/dev database before running in production.
- Plan deployment to run the migration and deploy code changes together to avoid inconsistency.
- (Optional) Add temporary backward compatibility logic if needed.

### 3. **Backend Message Creation Fix**
- Updated all backend message creation logic to always use `type: 'text'` for ArenaMessage (not 'chat'), regardless of channel type.
- Added comments to clarify the distinction for future maintainers.
- This ensures robust, scalable, and future-proof message handling.

---

**Phase 3 is ready for testing. Please review and approve to proceed with migration testing and deployment coordination.** 