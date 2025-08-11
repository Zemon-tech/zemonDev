### Forge HTML Rendering: Robust, Scalable Fix Plan

This plan addresses interactive HTML content (accordions, tabs, carousels) not working in the Forge detail page, without disturbing current UI or functionality.

### Goals
- **Restore interactive behavior** for provided HTML content (accordions, tabs, etc.).
- **Avoid regressions** for existing Forge content and overall app UI.
- **Remain flexible** for future, richer HTML content authored by admins.

### Root Causes (Summary)
- **Selector mismatch**: Renderer initializes only specific class/data patterns; content may use different class names.
- **Event listener clobbering**: Renderer clones nodes (to remove listeners) and reattaches its own, conflicting with inline scripts shipped in content.
- **Timing/race conditions**: Inline scripts run immediately; renderer initializes later, overriding behavior.

### Strategy Overview
Implement a "smart initialization" model that:
- Defers to content’s own scripts when present.
- Initializes built-in behaviors only when content has no scripts (or explicitly opts in).
- Broadens selector support to accommodate common patterns.
- Offers an optional, sandboxed iframe mode for complex cases.

### Scope of Changes
- Localized to `frontend/src/components/ui/html-content-renderer.tsx` and docs only.
- Optional prop addition in `frontend/src/pages/ForgeDetailPage.tsx` (default preserves current behavior).
- No visual changes to existing UI.

### Detailed Plan

1) Safe Script-Oriented Guardrails (No UI change)
- Detect if content contains inline or external scripts or inline event handlers:
  - Presence of `<script>` tags, `on*=` attributes (e.g., `onclick`), or function calls referenced by HTML attributes.
- If scripts are detected:
  - **Execute scripts** and **skip renderer’s interactive re-initialization** (accordions/tabs/carousels). Content’s own scripts remain in control.
  - Keep current style injection behavior intact.
- If no scripts are detected:
  - Run renderer’s interactive initialization as a progressive enhancement.

2) Stop Clobbering Event Listeners (No UI change)
- Remove the cloning-based listener reset. Instead:
  - Use event delegation from the container where possible or attach listeners only when an element is not already marked as initialized.
  - Mark elements with `data-initialized="true"` to avoid duplicate binding.
  - Never remove existing listeners.

3) Broaden Selector Compatibility (No UI change)
- Expand supported selectors to include both data- and class-based patterns used in common authored content:
  - Accordions: `.accordion` wrapper optional; support `.accordion-header` + sibling `.accordion-content` in addition to `[data-accordion-*]`.
  - Tabs: support `.tabs .tab-button` and matching `.tab-content` by `id`, plus `[data-tabs]`, `[data-tab]`, `[data-tab-content]`.
  - Carousels: support existing patterns; do not override if scripts present.

4) Deterministic Initialization Order (No UI change)
- Ensure inline/external scripts execute to completion before any optional renderer initialization by:
  - Running script execution, then scheduling optional initialization with `requestAnimationFrame` (twice) to avoid race conditions.
  - No arbitrary timeouts.

5) Optional Rendering Modes (Backward compatible)
- Add optional prop to `HtmlContentRenderer`:
  - `initializationMode`: `'auto' | 'content-scripts' | 'renderer'`.
    - `auto` (default): script-detection guardrails decide.
    - `content-scripts`: always execute content scripts; never run renderer init.
    - `renderer`: skip content-script binding and use renderer-only init (for script-free authored content).
- `ForgeDetailPage` can continue using defaults; no change needed unless we want to override.

6) Optional Iframe Sandboxing (Opt-in, no UI change by default)
- Provide `renderInIframe?: boolean` (default `false`). When `true`:
  - Render full HTML in an iframe to eliminate any CSS/JS conflicts with the app.
  - Auto-resize iframe height via `postMessage` from content or via MutationObserver.
  - Keep off by default to avoid layout/SEO changes; expose as an advanced toggle per resource if needed later.

7) Documentation Updates (Authoring guidance)
- Update `docs/HTML_CONTENT_CAPABILITIES.md` with:
  - Authoring tips for class/data patterns recognized by the renderer.
  - Recommendation: include your own scripts if you need custom behavior; the renderer will defer automatically.
  - Optional attributes to opt-in to renderer initialization (e.g., `[data-tabs]`).

8) Tests
- Unit tests (jsdom) for `HtmlContentRenderer`:
  - Case: content with inline scripts → renderer defers; interactions work.
  - Case: content without scripts but with `.accordion-header` patterns → renderer initializes once; interactions work.
  - Case: both external and inline scripts → order preserved; no duplicate listeners.
- Integration test (Cypress): load a Forge detail page containing the provided sample content and verify accordion/tabs behavior.

### Rollout Plan
- Implement behind non-breaking defaults (`initializationMode: 'auto'`, `renderInIframe: false`).
- Verify locally and in staging with sample content.
- Monitor for regressions; provide quick toggle to `'content-scripts'` per page if any issue is observed.

### Acceptance Criteria
- Provided sample content: accordion toggles and tabs switch correctly.
- Existing Forge resources without scripts maintain current visuals and behavior.
- No global CSS/JS regressions in the app.
- No duplicate event listeners; no console errors from renderer.

### Risks & Mitigations
- Mixed control (both content scripts and renderer) → mitigated by script detection and explicit modes.
- CSS leakage from content → optional iframe mode available.
- External script load failures → already handled with error logging; renderer remains passive when scripts exist.

### Estimated Impact
- Changes confined to `HtmlContentRenderer`; optional prop in `ForgeDetailPage` only if needed.
- No layout or style changes to existing UI by default.


