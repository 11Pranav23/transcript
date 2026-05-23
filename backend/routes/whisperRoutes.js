import express from 'express';
import multer from 'multer';
import path from 'path';
import os from 'os';
import { transcribeAudio } from '../controllers/whisperController.js';

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tempDir = os.tmpdir();
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'audio-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'audio/x-m4a',
    'audio/ogg',
    'audio/flac',
    'audio/webm'
  ];

  if (allowedMimes.includes(file.mimetype) || file.originalname.match(/\.(mp3|wav|m4a|ogg|flac|webm)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 25 * 1024 * 1024 // 25MB limit
  }
});

router.post('/transcribe', upload.single('audio'), transcribeAudio);

export default router;
