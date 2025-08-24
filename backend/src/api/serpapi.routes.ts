import express from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  webSearch,
  newsSearch,
  scholarSearch,
  imageSearch,
  getTrending,
  localSearch,
  getAnswerBoxInfo,
  shoppingSearch,
  multiEngineSearch,
  researchSearch
} from '../controllers/serpapi.controller';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Web search routes
router.post('/web-search', webSearch);
router.post('/news-search', newsSearch);
router.post('/scholar-search', scholarSearch);
router.post('/image-search', imageSearch);
router.get('/trending', getTrending);
router.post('/local-search', localSearch);
router.post('/answer-box', getAnswerBoxInfo);
router.post('/shopping-search', shoppingSearch);
router.post('/multi-engine-search', multiEngineSearch);
router.post('/research-search', researchSearch);

export default router;
