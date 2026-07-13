import express from 'express';
import { getAllClaims, createClaim } from '../controllers/claimController.js';

const router = express.Router();

router.get('/', getAllClaims);
router.post('/', createClaim);

export default router;
