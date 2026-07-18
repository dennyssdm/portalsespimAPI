import express from 'express';
import {
  processChat,
  requestOperator,
  getChatbotStats,
  getActiveSessions,
  getSessionMessages,
  sendOperatorReply
} from '../controllers/chatbotController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes for chatbot visitor interactions
router.post('/', processChat);
router.post('/request-operator', requestOperator);
router.get('/messages/:sessionId', getSessionMessages);

// Protected routes for Superadmin / Admin Monitoring Dashboard
router.get('/stats', protect, restrictTo('super_admin', 'admin', 'stakeholder'), getChatbotStats);
router.get('/sessions', protect, restrictTo('super_admin', 'admin', 'stakeholder'), getActiveSessions);
router.post('/operator-reply', protect, restrictTo('super_admin', 'admin'), sendOperatorReply);

export default router;
