import express from 'express';
import { uploadSession, getSessions } from '../controllers/sessionController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/upload', authMiddleware, uploadSession);
router.get('/', authMiddleware, getSessions);

export default router;
