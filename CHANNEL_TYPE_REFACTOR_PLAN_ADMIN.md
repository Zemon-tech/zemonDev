# Channel Type Refactor Plan (Admin Apps): `text` → `chat`, `readonly` → `showcase`

## **Goal**
Update all code, types, API, and data references in both `backend-admin` and `frontend-admin` so that:
- Channel type `'text'` becomes `'chat'`
- Channel type `'readonly'` becomes `'showcase'`
- All logic, validation, and documentation reflect the new names

This plan is designed to be robust, scalable, and minimize downtime or data inconsistency.

---

## Phase 1: Audit & Preparation — Findings
- `backend-admin/src/models/arenaChannel.model.ts` already uses the new types: `'chat' | 'announcement' | 'showcase'` (no changes needed).
- `frontend-admin/src/components/channels/ChannelTable.tsx` and `frontend-admin/src/pages/ChannelsPage.tsx` still use the old types: `'text' | 'announcement' | 'readonly'` (need to be updated).
- No channel type logic found in backend-admin controllers/services (API is a passthrough for ArenaChannel).
- No test or markdown files in backend-admin or frontend-admin reference channel types.
- All database migration is already done (no further action needed).

**Files to update in Phase 2:**
- `frontend-admin/src/components/channels/ChannelTable.tsx`
- `frontend-admin/src/pages/ChannelsPage.tsx`

---

## **Phase 2: Codebase Refactor (Non-Data)**
1. **Types & Schemas**
   - Update all TypeScript types, interfaces, and enums to use `'chat'` and `'showcase'` instead of `'text'` and `'readonly'`.
   - Update Mongoose schemas and validation logic in `backend-admin`.

2. **Controllers, Services, and Logic**
   - Update all backend and frontend logic that checks or sets channel type values.
   - Update any permission logic, UI rendering, or business rules that depend on these types.

3. **API Contracts**
   - Update API request/response validation and documentation.
   - Ensure all endpoints expect and return the new type values.

4. **Frontend Components & Hooks**
   - Update all components, hooks, and context providers that use or display channel types in `frontend-admin`.
   - Update any hardcoded UI labels or logic.

5. **Tests & Documentation**
   - Update or add tests to cover the new type values.
   - Update all relevant documentation and markdown files.

---

## **Phase 3: Data Migration (If Needed)**
1. **Migration Script**
   - If `backend-admin` manages channel data, write a migration script to update all existing channel documents:
     - `type: 'text'` → `type: 'chat'`
     - `type: 'readonly'` → `type: 'showcase'`
   - Test the migration on a staging/dev database first.

2. **Deployment Coordination**
   - Plan for a short maintenance window if needed.
   - Deploy code changes and run the migration script in a coordinated fashion to avoid data inconsistency.
   - (Optional) Add temporary backward compatibility logic if needed.

---

## **Phase 4: Verification & Cleanup**
1. **Testing**
   - Manually and automatically test all channel-related features in both admin apps.
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