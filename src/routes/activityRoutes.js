import express from 'express';
import {
  logActivity,
  getActivityStats,
  getActiveUsersRanking,
  clearLogs
} from '../controllers/activityController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public route to allow frontend to push logs (for page views, homepage visits, etc.)
router.post('/log', logActivity);

// Protected dashboard analytics routes (for Kasespim / Stakeholders and Admin users)
router.get('/stats', protect, restrictTo('super_admin', 'stakeholder', 'admin'), getActivityStats);
router.get('/users-ranking', protect, restrictTo('super_admin', 'stakeholder', 'admin'), getActiveUsersRanking);

// Maintenance route (Super Admin only)
router.delete('/clear', protect, restrictTo('super_admin'), clearLogs);

export default router;
