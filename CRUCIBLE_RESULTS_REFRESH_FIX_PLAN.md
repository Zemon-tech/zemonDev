## Crucible Results Refresh Bug — Minimal Fix Plan

### Context (1–2 lines)
- Symptom: Refreshing the results page shows “Analysis Incomplete”.
- Root cause: On `/:username/crucible/results/:analysisId`, `ResultPage.tsx` fetches the analysis but does not fetch the related problem; the render gate requires both.

### Fix — Only the necessary steps
1) In `frontend/src/pages/ResultPage.tsx`, inside the effect that runs on `analysisId`:
   - After `getAnalysisResult(analysisId)` resolves, set a local `currentProblemId = fetchedAnalysis.problemId`.
   - If `currentProblemId` is set and the current `problem` is null or mismatched, call `getProblem(currentProblemId)` and store it in state.
   - Keep the existing `isMounted` guard to avoid setting state after unmount.

2) Adjust the render condition in `ResultPage.tsx` minimally:
   - While either analysis or problem is still loading, keep showing the loading view (do not fall through to “Analysis Incomplete”).
   - Only show “Analysis Incomplete” when both have finished loading and the analysis fails validation.

### Acceptance criteria
- Refreshing `/:username/crucible/results/:analysisId` renders the full results without showing “Analysis Incomplete”.
- Existing problem-based route continues to work.



