import express from 'express';
import { generateDub } from '../controllers/dubbingController.js';

const router = express.Router();

router.post('/generate', generateDub);

export default router;
