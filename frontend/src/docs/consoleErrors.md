Applied theme: dark
utils.ts:113 Auth token cleared
utils.ts:113 Auth token cleared
App.tsx:67 WorkspaceLayout auth state: {isLoaded: false, isSignedIn: undefined}
ThemeContext.tsx:69 Initializing with saved theme: dark
ThemeContext.tsx:22 Applied theme: dark
App.tsx:84 Using Clerk with key prefix: pk_test_...
ThemeContext.tsx:22 Applied theme: dark
utils.ts:113 Auth token cleared
utils.ts:113 Auth token cleared
App.tsx:67 WorkspaceLayout auth state: {isLoaded: false, isSignedIn: undefined}
ThemeContext.tsx:69 Initializing with saved theme: dark
ThemeContext.tsx:22 Applied theme: dark
App.tsx:84
Clerk: Clerk has been loaded with development keys. Development instances have strict usage limits and should not be used when deploying your application to production. Learn more: https://clerk.com/docs/deployments/overview
warnOnce @ clerk.browser.js:16
load @ clerk.browser.js:5
loadClerkJS @ @clerk_clerk-react.js?v=f118b5e8:5663
await in loadClerkJS
_IsomorphicClerk2 @ @clerk_clerk-react.js?v=f118b5e8:5536
getOrCreateInstance @ @clerk_clerk-react.js?v=f118b5e8:5562
useLoadedIsomorphicClerk @ @clerk_clerk-react.js?v=f118b5e8:5824
ClerkContextProvider @ @clerk_clerk-react.js?v=f118b5e8:5761
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooks @ react-dom_client.js?v=5b6dd849:4206
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ClerkProvider>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:88
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
middleware.tsx:189 Auth middleware state: {isLoaded: true, isSignedIn: true, path: '/satya/crucible/problem/507f1f77bcf86cd799439013'}
App.tsx:67 WorkspaceLayout auth state: {isLoaded: true, isSignedIn: true}
3utils.ts:113 Auth token set
utils.ts:161 API_Call_/crucible/507f1f77bcf86cd799439013_1751864917751: 116.614990234375 ms
utils.ts:113 CrucibleWorkspaceView auth state: {isLoaded: true, isSignedIn: true, problemId: '507f1f77bcf86cd799439013'}
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Starting problem data fetch: 507f1f77bcf86cd799439013
utils.ts:113 Using cached data for /crucible/507f1f77bcf86cd799439013
utils.ts:113 CrucibleWorkspaceView auth state: {isLoaded: true, isSignedIn: true, problemId: '507f1f77bcf86cd799439013'}
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Starting draft data fetch: 507f1f77bcf86cd799439013
utils.ts:113 Starting notes data fetch: 507f1f77bcf86cd799439013
utils.ts:161 Problem data fetch: 6.716064453125 ms
utils.ts:113 Auth token set
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:161 API_Call_/crucible/507f1f77bcf86cd799439013_1751864917754: 214.0009765625 ms
GET http://localhost:3001/api/crucible/507f1f77bcf86cd799439013/draft 500 (Internal Server Error)
window.fetch @ middleware.tsx:161
fetchWithCache @ crucibleApi.ts:262
getDraft @ crucibleApi.ts:350
(anonymous) @ CrucibleWorkspaceView.tsx:168
(anonymous) @ CrucibleWorkspaceView.tsx:314
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:161 API_Call_/crucible/507f1f77bcf86cd799439013/draft_1751864917875: 9406.928955078125 ms
utils.ts:120 API Error for /crucible/507f1f77bcf86cd799439013/draft: Error: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at fetchWithCache (crucibleApi.ts:287:13)
    at async CrucibleWorkspaceView.tsx:168:25
    at async Promise.all (index 0)
error @ utils.ts:120
fetchWithCache @ crucibleApi.ts:307
await in fetchWithCache
getDraft @ crucibleApi.ts:350
(anonymous) @ CrucibleWorkspaceView.tsx:168
(anonymous) @ CrucibleWorkspaceView.tsx:314
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:120 Error fetching draft for problem 507f1f77bcf86cd799439013: Error: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at fetchWithCache (crucibleApi.ts:287:13)
    at async CrucibleWorkspaceView.tsx:168:25
    at async Promise.all (index 0)
error @ utils.ts:120
(anonymous) @ crucibleApi.ts:358
Promise.catch
getDraft @ crucibleApi.ts:357
(anonymous) @ CrucibleWorkspaceView.tsx:168
(anonymous) @ CrucibleWorkspaceView.tsx:314
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11432
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?
v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:120 Error fetching draft: Error: Failed to load draft: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at crucibleApi.ts:359:15
    at async CrucibleWorkspaceView.tsx:168:25
    at async Promise.all (index 0)
error @ utils.ts:120
(anonymous) @ CrucibleWorkspaceView.tsx:169
Promise.catch
(anonymous) @ CrucibleWorkspaceView.tsx:168
(anonymous) @ CrucibleWorkspaceView.tsx:314
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11432
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:120 Server error when fetching draft

Server Error: There was a problem fetching your draft. Your work will still be saved.
utils.ts:113 No existing draft found or error occurred, starting with empty content
utils.ts:161 Draft data fetch: 9409.52197265625 ms
SolutionEditor.tsx:45 [tiptap warn]: Duplicate extension names found: ['codeBlock']. This can lead to issues.
resolve @ chunk-64BSYSFP.js?v=2dc1c60b:13089
_ExtensionManager @ chunk-64BSYSFP.js?v=2dc1c60b:13075
createExtensionManager @ chunk-64BSYSFP.js?v=2dc1c60b:15959
Editor @ chunk-64BSYSFP.js?v=2dc1c60b:15799
createEditor @ @tiptap_react.js?v=05d3970a:3799
getInitialEditor @ @tiptap_react.js?v=05d3970a:3737
_EditorInstanceManager @ @tiptap_react.js?v=05d3970a:3714
(anonymous) @ @tiptap_react.js?v=05d3970a:3918
mountStateImpl @ react-dom_client.js?v=5b6dd849:4660
mountState @ react-dom_client.js?v=5b6dd849:4681
useState @ react-dom_client.js?v=5b6dd849:16540
exports.useState @ chunk-UGC3UZ7L.js?v=2dc1c60b:927
useEditor @ @tiptap_react.js?v=05d3970a:3918
SolutionEditor @ SolutionEditor.tsx:45
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooks @ react-dom_client.js?v=5b6dd849:4206
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
updateSimpleMemoComponent @ react-dom_client.js?v=5b6dd849:6528
updateMemoComponent @ react-dom_client.js?v=5b6dd849:6482
beginWork @ react-dom_client.js?v=5b6dd849:7915
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<SolutionEditor>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleWorkspaceView @ CrucibleWorkspaceView.tsx:517
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
SolutionEditor.tsx:45 [tiptap warn]: Duplicate extension names found: ['codeBlock']. This can lead to issues.
resolve @ chunk-64BSYSFP.js?v=2dc1c60b:13089
_ExtensionManager @ chunk-64BSYSFP.js?v=2dc1c60b:13075
createExtensionManager @ chunk-64BSYSFP.js?v=2dc1c60b:15959
Editor @ chunk-64BSYSFP.js?v=2dc1c60b:15799
createEditor @ @tiptap_react.js?v=05d3970a:3799
getInitialEditor @ @tiptap_react.js?v=05d3970a:3737
_EditorInstanceManager @ @tiptap_react.js?v=05d3970a:3714
(anonymous) @ @tiptap_react.js?v=05d3970a:3918
mountStateImpl @ react-dom_client.js?v=5b6dd849:4664
mountState @ react-dom_client.js?v=5b6dd849:4681
useState @ react-dom_client.js?v=5b6dd849:16540
exports.useState @ chunk-UGC3UZ7L.js?v=2dc1c60b:927
useEditor @ @tiptap_react.js?v=05d3970a:3918
SolutionEditor @ SolutionEditor.tsx:45
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooks @ react-dom_client.js?v=5b6dd849:4206
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
updateSimpleMemoComponent @ react-dom_client.js?v=5b6dd849:6528
updateMemoComponent @ react-dom_client.js?v=5b6dd849:6482
beginWork @ react-dom_client.js?v=5b6dd849:7915
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<SolutionEditor>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleWorkspaceView @ CrucibleWorkspaceView.tsx:517
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
middleware.tsx:161  GET http://localhost:3001/api/crucible/507f1f77bcf86cd799439013/notes 500 (Internal Server Error)
window.fetch @ middleware.tsx:161
fetchWithCache @ crucibleApi.ts:262
getNotes @ crucibleApi.ts:389
(anonymous) @ CrucibleWorkspaceView.tsx:258
(anonymous) @ CrucibleWorkspaceView.tsx:315
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11432
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:161 API_Call_/crucible/507f1f77bcf86cd799439013/notes_1751864917875: 9653.856201171875 ms
utils.ts:120 API Error for /crucible/507f1f77bcf86cd799439013/notes: Error: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at fetchWithCache (crucibleApi.ts:287:13)
    at async CrucibleWorkspaceView.tsx:258:25
    at async Promise.all (index 1)
error @ utils.ts:120
fetchWithCache @ crucibleApi.ts:307
await in fetchWithCache
getNotes @ crucibleApi.ts:389
(anonymous) @ CrucibleWorkspaceView.tsx:258
(anonymous) @ CrucibleWorkspaceView.tsx:315
Promise.then
(anonymous) @ CrucibleWorkspaceView.tsx:310
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10016
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10054
recursivelyTraverseReconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:9995
reconnectPassiveEffects @ react-dom_client.js?v=5b6dd849:10009
doubleInvokeEffectsOnFiber @ react-dom_client.js?v=5b6dd849:11461
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11432
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
recursivelyTraverseAndDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11438
commitDoubleInvokeEffectsInDEV @ react-dom_client.js?v=5b6dd849:11469
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11309
(anonymous) @ react-dom_client.js?v=5b6dd849:11060
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleWorkspaceView>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
CrucibleProblemPage @ CrucibleProblemPage.tsx:134
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<CrucibleProblemPage>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
ProtectedRoute @ middleware.tsx:245
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<ProtectedRoute>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
App @ App.tsx:115
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17424
renderWithHooksAgain @ react-dom_client.js?v=5b6dd849:4281
renderWithHooks @ react-dom_client.js?v=5b6dd849:4217
updateFunctionComponent @ react-dom_client.js?v=5b6dd849:6619
beginWork @ react-dom_client.js?v=5b6dd849:7654
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
performUnitOfWork @ react-dom_client.js?v=5b6dd849:10868
workLoopSync @ react-dom_client.js?v=5b6dd849:10728
renderRootSync @ react-dom_client.js?v=5b6dd849:10711
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10330
performWorkOnRootViaSchedulerTask @ react-dom_client.js?v=5b6dd849:11623
performWorkUntilDeadline @ react-dom_client.js?v=5b6dd849:36
<App>
exports.jsxDEV @ react_jsx-dev-runtime.js?v=11536937:250
(anonymous) @ main.tsx:8
utils.ts:113 No existing notes found, starting with empty content
utils.ts:161 Notes data fetch: 9654.98193359375 ms
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Max loading time reached, forcing loading state to false
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Max loading time reached, forcing loading state to false
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Max loading time reached, forcing loading state to false
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Max loading time reached, forcing loading state to false
utils.ts:113 CrucibleWorkspaceView loading state changed: {loadingState: {…}, hasFetched: {…}, error: null, authError: false}
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Problem data already fetched, skipping
utils.ts:113 Draft data already fetched, skipping
utils.ts:113 Notes data already fetched, skipping
utils.ts:113 Auto-saving draft...
middleware.tsx:161  PUT http://localhost:3001/api/crucible/507f1f77bcf86cd799439013/draft 500 (Internal Server Error)
window.fetch @ middleware.tsx:161
fetchWithCache @ crucibleApi.ts:262
updateDraft @ crucibleApi.ts:374
(anonymous) @ CrucibleWorkspaceView.tsx:348
setTimeout
(anonymous) @ CrucibleWorkspaceView.tsx:343
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9887
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9890
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9899
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11302
flushPendingEffects @ react-dom_client.js?v=5b6dd849:11276
flushSpawnedWork @ react-dom_client.js?v=5b6dd849:11250
commitRoot @ react-dom_client.js?v=5b6dd849:11081
commitRootWhenReady @ react-dom_client.js?v=5b6dd849:10512
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10457
performSyncWorkOnRoot @ react-dom_client.js?v=5b6dd849:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=5b6dd849:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=5b6dd849:11558
(anonymous) @ react-dom_client.js?v=5b6dd849:11649
utils.ts:161 API_Call_/crucible/507f1f77bcf86cd799439013/draft_1751865012888: 9728.281005859375 ms
utils.ts:120 API Error for /crucible/507f1f77bcf86cd799439013/draft: Error: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at fetchWithCache (crucibleApi.ts:287:13)
    at async CrucibleWorkspaceView.tsx:348:9
error @ utils.ts:120
fetchWithCache @ crucibleApi.ts:307
await in fetchWithCache
updateDraft @ crucibleApi.ts:374
(anonymous) @ CrucibleWorkspaceView.tsx:348
setTimeout
(anonymous) @ CrucibleWorkspaceView.tsx:343
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9887
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9890
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9899
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11302
flushPendingEffects @ react-dom_client.js?v=5b6dd849:11276
flushSpawnedWork @ react-dom_client.js?v=5b6dd849:11250
commitRoot @ react-dom_client.js?v=5b6dd849:11081
commitRootWhenReady @ react-dom_client.js?v=5b6dd849:10512
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10457
performSyncWorkOnRoot @ react-dom_client.js?v=5b6dd849:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=5b6dd849:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=5b6dd849:11558
(anonymous) @ react-dom_client.js?v=5b6dd849:11649
utils.ts:120 Failed to auto-save draft: Error: API Error (500): {"success":false,"message":"An unexpected internal server error occurred."}
    at fetchWithCache (crucibleApi.ts:287:13)
    at async CrucibleWorkspaceView.tsx:348:9
error @ utils.ts:120
(anonymous) @ CrucibleWorkspaceView.tsx:356
setTimeout
(anonymous) @ CrucibleWorkspaceView.tsx:343
react-stack-bottom-frame @ react-dom_client.js?v=5b6dd849:17478
runWithFiberInDEV @ react-dom_client.js?v=5b6dd849:1485
commitHookEffectListMount @ react-dom_client.js?v=5b6dd849:8460
commitHookPassiveMountEffects @ react-dom_client.js?v=5b6dd849:8518
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9887
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9890
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9881
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9984
recursivelyTraversePassiveMountEffects @ react-dom_client.js?v=5b6dd849:9868
commitPassiveMountOnFiber @ react-dom_client.js?v=5b6dd849:9899
flushPassiveEffects @ react-dom_client.js?v=5b6dd849:11302
flushPendingEffects @ react-dom_client.js?v=5b6dd849:11276
flushSpawnedWork @ react-dom_client.js?v=5b6dd849:11250
commitRoot @ react-dom_client.js?v=5b6dd849:11081
commitRootWhenReady @ react-dom_client.js?v=5b6dd849:10512
performWorkOnRoot @ react-dom_client.js?v=5b6dd849:10457
performSyncWorkOnRoot @ react-dom_client.js?v=5b6dd849:11635
flushSyncWorkAcrossRoots_impl @ react-dom_client.js?v=5b6dd849:11536
processRootScheduleInMicrotask @ react-dom_client.js?v=5b6dd849:11558
(anonymous) @ react-dom_client.js?v=5b6dd849:11649
utils.ts:113 Save Error: Failed to save your draft. Will retry automatically.
utils.ts:113 Max loading time reached, forcing loading state to false