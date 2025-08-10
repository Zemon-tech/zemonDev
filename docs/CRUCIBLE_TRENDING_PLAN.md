## Crucible Trending Problems — Minimal, Robust Plan

### Goal
- Track trending Crucible problems based on the number of completed analyses (counts include reattempts) and display the top 3 on the Crucible page. Remove the "View all" link from the Trending section. No extra features.

### Phase 0 — Source of Truth & Constraints
- Use `SolutionAnalysis` documents as the event source. Each saved analysis equals one solve count for its `problemId` (reattempts automatically count).
- Do not modify existing counters that increment only on first solve.
- Keep UI intact; only remove the "View all" link and replace mock data with API data.

### Phase 1 — Backend API (Read-only Aggregation)
- Add `GET /api/crucible/trending?limit=3`.
- Implementation (controller/service):
  - Aggregate on `SolutionAnalysis`:
    - Group by `problemId`, `count: {$sum: 1}`.
    - Sort by `count` desc; apply `limit` (default 3; cap to a reasonable max like 10).
    - `$lookup` problem details from `CrucibleProblem` (title, difficulty, category/tags, etc.).
    - Project minimal fields: `{ problemId, title, difficulty, category, solvedCount: count }`.
- Indexes/Perf: Use existing index on `{ userId: 1, problemId: 1 }` and `createdAt`; grouping by `problemId` is efficient enough with limit. No writes; no schema changes.

### Phase 2 — Frontend Integration
- Add `getTrendingProblems(limit = 3)` to `frontend/src/lib/crucibleApi.ts`.
- Update `frontend/src/pages/CruciblePage.tsx`:
  - Remove the "View all" button in the Trending section.
  - Replace mock `hotProblems` with data from `getTrendingProblems()` on mount.
  - Map API fields to existing card props (id, title, difficulty, category, solvedCount). Do not change card UI structure or styles (DaisyUI stays as-is).
- Error/empty handling: if API fails or returns <3 items, show whatever returns (no extra placeholders).

### Phase 3 — QA & Validation
- Cases:
  - Multiple analyses for same problem (reattempts) increase its count.
  - With limited data, fewer than 3 items render without layout break.
  - Existing Crucible page behaviors unaffected; navigation from cards still works.
- Check backend aggregation output for correctness and performance on dev data.

### Acceptance Criteria
- Submitting a solution that produces an analysis increases the corresponding problem’s trending count (reattempts included).
- `/:username/crucible` Trending section displays the top 3 problems from the new endpoint.
- The "View all" link is removed; no other UI changes.


