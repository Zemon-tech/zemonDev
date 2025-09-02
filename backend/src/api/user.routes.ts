import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, getUserRole, updateProfileBackground, recordDailyVisitController, getStreakInfoController, changePasswordController, updateSkillsController, deleteAccountController, exportUserDataController, getStreakLeaderboard, getStreakPercentileController, getUserProjectsController, getWorkspacePreferencesController, updateWorkspacePreferencesController, getBookmarkedResourcesController, removeBookmarkController, getPublicUserProfileController, updateProfileVisibilityController, searchUsersController, getUserScoringController, getUserDashboardController, recomputeUserAnalyticsController, setActiveGoalController, getUserInsightsController, getNextUpController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = Router();

// Public routes
router.get('/leaderboard/streak', standardLimiter, cacheMiddleware(300), getStreakLeaderboard);
router.get('/public/:username', standardLimiter, cacheMiddleware(300), getPublicUserProfileController);
router.get('/search', standardLimiter, cacheMiddleware(300), searchUsersController);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/me/role', protect, getUserRole);
router.patch('/me', protect, updateCurrentUser);
router.patch('/me/background', protect, updateProfileBackground);
router.patch('/me/visibility', protect, updateProfileVisibilityController);
router.post('/me/visit', protect, recordDailyVisitController);
router.get('/me/streak', protect, getStreakInfoController);
router.get('/me/streak-percentile', protect, getStreakPercentileController);
router.get('/me/scoring', protect, getUserScoringController);
router.get('/me/dashboard', protect, getUserDashboardController);
router.get('/me/insights', protect, getUserInsightsController);
router.get('/me/next-up', protect, getNextUpController);
router.post('/me/recompute-analytics', protect, recomputeUserAnalyticsController);
router.post('/me/goal', protect, setActiveGoalController);
router.patch('/me/password', protect, changePasswordController);
router.patch('/me/skills', protect, updateSkillsController);
router.delete('/me', protect, deleteAccountController);
router.get('/me/export', protect, exportUserDataController);

// Project and Workspace Management
router.get('/me/projects', protect, getUserProjectsController);
router.get('/me/workspace-preferences', protect, getWorkspacePreferencesController);
router.patch('/me/workspace-preferences', protect, updateWorkspacePreferencesController);
router.get('/me/bookmarks', protect, getBookmarkedResourcesController);
router.delete('/me/bookmarks/:resourceId', protect, removeBookmarkController);

export default router;


