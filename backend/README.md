# YouTube Transcript Generator Backend

Express.js backend API for extracting and analyzing YouTube video transcripts with AI-powered summaries.

## Features

- **Transcript Extraction**: Fetch transcripts from YouTube videos with timestamps
- **AI Analysis**: Generate summaries, extract key points, create flashcards
- **Multi-language Support**: Extract transcripts in multiple languages
- **Export Options**: Download as TXT, PDF, or DOCX
- **Real-time Updates**: WebSocket support for progress updates

## Prerequisites

- Node.js 16+ (`node --version`)
- npm 8+ (`npm --version`)
- API Keys:
  - YouTube Data API v3
  - OpenAI API (for AI features)

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create `.env` file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```env
   PORT=5000
   NODE_ENV=development
   YOUTUBE_API_KEY=your_youtube_api_key
   OPENAI_API_KEY=your_openai_api_key
   FRONTEND_URL=http://localhost:3000
   ```

## Getting API Keys

### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create an API key (Credentials → Create Credentials → API Key)

### OpenAI API Key
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy and paste in `.env`

## Running the Server

**Development** (with auto-reload):
```bash
npm run dev
```

**Production**:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Transcript Routes (`/api/transcript`)
- `POST /fetch` - Extract transcript from YouTube video
- `POST /languages` - Get available languages for a video
- `GET /metadata/:videoId` - Get video metadata (title, channel, stats)

### AI Routes (`/api/ai`)
- `POST /summarize` - Generate transcript summary
- `POST /keypoints` - Extract key points
- `POST /flashcards` - Generate study flashcards
- `POST /question` - Answer questions based on transcript

### Export Routes (`/api/export`)
- `POST /text` - Export as plain text
- `POST /pdf` - Export as PDF
- `POST /docx` - Export as Word document

## Project Structure

```
backend/
├── controllers/        # Business logic
│   ├── transcriptController.js
│   ├── aiController.js
│   └── exportController.js
├── routes/            # API routes
│   ├── transcriptRoutes.js
│   ├── aiRoutes.js
│   └── exportRoutes.js
├── middleware/        # Express middleware
│   └── errorHandler.js
├── utils/             # Utility functions
├── server.js          # Main server file
├── package.json       # Dependencies
└── .env.example      # Environment variables template
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `400` - Bad Request
- `403` - Forbidden (transcripts disabled)
- `404` - Not Found
- `500` - Server Error

## Rate Limiting

- YouTube API: Follows Google's quota system
- OpenAI API: Follows OpenAI's rate limits
- Transcripts are cached for 1 hour by default

## Troubleshooting

### "Transcripts are disabled"
- The video owner has restricted transcript access
- Solution: Use a different video

### "OpenAI API key not configured"
- Missing `OPENAI_API_KEY` in `.env`
- Solution: Add valid OpenAI API key

### "YouTube API quota exceeded"
- Exceeded daily quota for YouTube API
- Solution: Wait until quota resets or upgrade API plan

## Deployment

###  With Vercel (Not recommended for Node.js APIs)
Use a serverless provider like Railway or Heroku instead.

### With Railway
1. Push code to GitHub
2. Connect repository to Railway
3. Set environment variables
4. Deploy

### With Heroku
```bash
heroku login
heroku create your-app-name
git push heroku main
heroku config:set YOUTUBE_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
```

## Dependencies

- **express**: Web framework
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables
- **axios**: HTTP client
- **youtube-transcript**: Extract YouTube transcripts
- **openai**: OpenAI API client
- **socket.io**: Real-time updates
- **pdfkit**: PDF generation
- **docx**: Word document generation

## Support

For issues and questions:
1. Check troubleshooting section
2. Review error messages in console
3. Check API key validity
4. Verify network connectivity

## License

MIT
