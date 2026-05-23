import './config.js';

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import transcriptRoutes from './routes/transcriptRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import exportRoutes from './routes/exportRoutes.js';
import whisperRoutes from './routes/whisperRoutes.js';
import dubbingRoutes from './routes/dubbingRoutes.js';
import errorHandler from './middleware/errorHandler.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// CORS configuration - allow multiple frontend ports for development
const corsOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  process.env.FRONTEND_URL
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || corsOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Blocked request from origin: ${origin}`);
      callback(new Error('CORS policy: origin not allowed'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

const io = new SocketServer(httpServer, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static audio files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io accessible to routes
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'YouTube Transcript Generator Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /api/health',
      transcript: [
        'POST /api/transcript/fetch - Fetch YouTube transcript',
        'POST /api/transcript/languages - Get available languages',
        'GET /api/transcript/metadata/:videoId - Get video metadata'
      ],
      ai: [
        'POST /api/ai/summarize - Summarize transcript',
        'POST /api/ai/keypoints - Extract key points',
        'POST /api/ai/flashcards - Generate flashcards',
        'POST /api/ai/question - Answer questions about transcript'
      ],
      export: [
        'POST /api/export/text - Export as text',
        'POST /api/export/pdf - Export as PDF',
        'POST /api/export/docx - Export as DOCX'
      ],
      whisper: [
        'POST /api/whisper/transcribe - Transcribe audio file with Whisper'
      ]
    }
  });
});

// Routes
app.use('/api/transcript', transcriptRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/whisper', whisperRoutes);
app.use('/api/dubbing', dubbingRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    method: req.method,
    path: req.originalUrl,
    availableRoutes: {
      health: 'GET /api/health',
      transcript: [
        'POST /api/transcript/fetch',
        'POST /api/transcript/languages',
        'GET /api/transcript/metadata/:videoId'
      ],
      ai: [
        'POST /api/ai/summarize',
        'POST /api/ai/keypoints',
        'POST /api/ai/flashcards',
        'POST /api/ai/question'
      ],
      export: [
        'POST /api/export/text',
        'POST /api/export/pdf',
        'POST /api/export/docx'
      ],
      whisper: [
        'POST /api/whisper/transcribe'
      ]
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
});
