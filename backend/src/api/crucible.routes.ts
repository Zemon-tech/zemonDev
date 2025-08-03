import express from 'express';
import { 
  getAllChallenges, 
  getChallengeById, 
  submitSolution, 
  getSolutions,
  analyzeUserSolution,
  getAnalysisResult,
  getLatestAnalysisForUserProblem,
  getAnalysisHistoryForUserProblem,
  getLastSubmittedSolution
} from '../controllers/crucible.controller';
import { 
  getDraft, 
  updateDraft, 
  archiveDraft, 
  // REMOVED: getDraftVersions,
  reattemptDraft
} from '../controllers/solutionDraft.controller';
import {
  getNotes,
  updateNotes,
  deleteNotes
} from '../controllers/crucibleNote.controller';
import {
  getChatSessions,
  createChatSession,
  getChatSession,
  addChatMessage,
  addChatMessageStream,
  updateChatSession,
  deleteChatSession
} from '../controllers/aiChat.controller';
import {
  getWorkspaceState,
  updateWorkspaceState
} from '../controllers/workspaceState.controller';
import {
  getDiagrams,
  createDiagram,
  getDiagram,
  updateDiagram,
  deleteDiagram
} from '../controllers/crucibleDiagram.controller';
import {
  getProgress,
  updateProgress,
  updateMilestone,
  addMilestone,
  deleteMilestone
} from '../controllers/progressTracking.controller';
import {
  getResearchItems,
  createResearchItem,
  getResearchItem,
  updateResearchItem,
  deleteResearchItem
} from '../controllers/researchItem.controller';
import { protect } from '../middleware/auth.middleware';
import { standardLimiter } from '../middleware/rateLimiter.middleware';
import { cacheMiddleware } from '../middleware/cache.middleware';

const router = express.Router();

// Public routes with rate limiting and caching
router.get('/', standardLimiter, cacheMiddleware(600), getAllChallenges);
router.get('/:id', standardLimiter, cacheMiddleware(600), getChallengeById);
router.get('/:challengeId/solutions', standardLimiter, cacheMiddleware(300), getSolutions);

// Protected routes
router.post('/:challengeId/solutions', protect, submitSolution);

// Solution analysis routes
router.post('/:problemId/analyze', protect, analyzeUserSolution);
router.get('/results/:analysisId', protect, getAnalysisResult);
router.get('/:problemId/solutions/latest', protect, getLatestAnalysisForUserProblem);
router.get('/:problemId/solutions/history', protect, getAnalysisHistoryForUserProblem);
router.get('/:problemId/solutions/last-submitted', protect, getLastSubmittedSolution);

// Solution draft routes
router.get('/:problemId/draft', protect, getDraft);
router.put('/:problemId/draft', protect, updateDraft);
router.put('/:problemId/draft/archive', protect, archiveDraft);
// REMOVED: Version history route
// router.get('/:problemId/draft/versions', protect, getDraftVersions);
router.post('/:problemId/draft/reattempt', protect, reattemptDraft);

// Notes routes
router.get('/:problemId/notes', protect, getNotes);
router.put('/:problemId/notes', protect, updateNotes);
router.delete('/:problemId/notes', protect, deleteNotes);

// AI Chat routes
router.get('/:problemId/chats', protect, getChatSessions);
router.post('/:problemId/chats', protect, createChatSession);
router.get('/:problemId/chats/:chatId', protect, getChatSession);
router.post('/:problemId/chats/:chatId/messages', protect, addChatMessage);
router.post('/:problemId/chats/:chatId/messages/stream', protect, addChatMessageStream);
router.put('/:problemId/chats/:chatId', protect, updateChatSession);
router.delete('/:problemId/chats/:chatId', protect, deleteChatSession);

// Workspace State routes
router.get('/:problemId/workspace', protect, getWorkspaceState);
router.put('/:problemId/workspace', protect, updateWorkspaceState);

// Diagram routes
router.get('/:problemId/diagrams', protect, getDiagrams);
router.post('/:problemId/diagrams', protect, createDiagram);
router.get('/:problemId/diagrams/:diagramId', protect, getDiagram);
router.put('/:problemId/diagrams/:diagramId', protect, updateDiagram);
router.delete('/:problemId/diagrams/:diagramId', protect, deleteDiagram);

// Progress Tracking routes
router.get('/:problemId/progress', protect, getProgress);
router.put('/:problemId/progress', protect, updateProgress);
router.put('/:problemId/progress/milestones/:milestoneId', protect, updateMilestone);
router.post('/:problemId/progress/milestones', protect, addMilestone);
router.delete('/:problemId/progress/milestones/:milestoneId', protect, deleteMilestone);

// Research Item routes
router.get('/:problemId/research', protect, getResearchItems);
router.post('/:problemId/research', protect, createResearchItem);
router.get('/:problemId/research/:itemId', protect, getResearchItem);
router.put('/:problemId/research/:itemId', protect, updateResearchItem);
router.delete('/:problemId/research/:itemId', protect, deleteResearchItem);

export default router; 