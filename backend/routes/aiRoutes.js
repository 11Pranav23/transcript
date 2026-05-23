import express from 'express';
import { summarizeTranscript, extractKeyPoints, generateFlashcards, answerQuestion } from '../controllers/aiController.js';

const router = express.Router();

router.post('/summarize', summarizeTranscript);
router.post('/keypoints', extractKeyPoints);
router.post('/flashcards', generateFlashcards);
router.post('/question', answerQuestion);

export default router;
