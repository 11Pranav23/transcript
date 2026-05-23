import express from 'express';
import { exportAsText, exportAsPDF, exportAsDocx } from '../controllers/exportController.js';

const router = express.Router();

router.post('/text', exportAsText);
router.post('/pdf', exportAsPDF);
router.post('/docx', exportAsDocx);

export default router;
