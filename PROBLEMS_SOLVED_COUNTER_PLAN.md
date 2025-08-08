## Goal
Update and show a user’s Problems Solved without breaking anything.

## Write path (backend)
- Add `userProgress.service.ts` with idempotent:
  - `markProblemSolved({ userId, problemId, session? })`:
    - `$addToSet: { completedSolutions: problemId }`
    - If added, `$inc: { 'stats.problemsSolved': 1 }`
    - Use a MongoDB transaction (preferred) to avoid double-increments under race.

- Add wrapper service around analysis creation:
  - `createSolutionAnalysisAndUpdateProgress({ userId, problemId, analysisPayload })`:
    - Create `SolutionAnalysis`
    - Call `markProblemSolved` (reattempts won’t increment)

## Read path (backend)
- In `getCurrentUser`, return a stable number:
  - `solvedCount = user.stats?.problemsSolved ?? (user.completedSolutions?.length || 0)`

## Dashboard (frontend)
- In `DashboardPage.tsx`, use `useUserProfile()` and display:
  - `const solvedCount = userProfile?.stats?.problemsSolved ?? (userProfile?.completedSolutions?.length || 0)`
  - Replace hardcoded value with `solvedCount` (fallback 0 while loading).

## Data backfill (one-time)
- Script sets `stats.problemsSolved = completedSolutions.length` where needed.

## Rollout
1) Add services (write + wrapper)
2) Use wrapper in submission controller
3) Ensure `/me` returns `solvedCount`
4) Update dashboard card
5) Run backfill

## Success
- First-time solve increments once; reattempts do not.
- Dashboard shows real count from user doc.