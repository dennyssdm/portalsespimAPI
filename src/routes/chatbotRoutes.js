import express from 'express';
import { processChat } from '../controllers/chatbotController.js';

const router = express.Router();

// Public route to process chatbot messages
router.post('/', processChat);

export default router;
