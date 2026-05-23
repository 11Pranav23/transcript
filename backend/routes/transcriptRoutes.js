import express from 'express';
import { fetchTranscript, getAvailableLanguagesList, getVideoMetadata, getLanguages } from '../controllers/transcriptController.js';

const router = express.Router();

router.post('/fetch', fetchTranscript);
router.post('/languages', getLanguages); // Keep for backwards compatibility
router.get('/languages/:videoId', getAvailableLanguagesList);
router.get('/metadata/:videoId', getVideoMetadata);

export default router;
