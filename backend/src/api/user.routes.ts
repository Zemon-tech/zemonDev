import { Router } from 'express';
import { getCurrentUser, updateCurrentUser, handleClerkWebhook, getUserRole, updateProfileBackground, recordDailyVisitController, getStreakInfoController, changePasswordController, updateSkillsController, deleteAccountController, exportUserDataController } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/webhooks/clerk', handleClerkWebhook);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.get('/me/role', protect, getUserRole);
router.patch('/me', protect, updateCurrentUser);
router.patch('/me/background', protect, updateProfileBackground);
router.post('/me/visit', protect, recordDailyVisitController);
router.get('/me/streak', protect, getStreakInfoController);
router.patch('/me/password', protect, changePasswordController);
router.patch('/me/skills', protect, updateSkillsController);
router.delete('/me', protect, deleteAccountController);
router.get('/me/export', protect, exportUserDataController);

export default router;