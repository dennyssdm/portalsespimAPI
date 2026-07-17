import express from 'express';
import { getAllClaims, createClaim, deleteClaim } from '../controllers/claimController.js';
import { protect, restrictTo } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllClaims);
router.post('/', createClaim);
router.delete('/:id', protect, restrictTo('super_admin', 'admin'), deleteClaim);

export default router;
