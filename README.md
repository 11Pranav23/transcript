# YouTube Transcript Generator

A modern, AI-powered web application for extracting, analyzing, and exporting YouTube video transcripts. Similar to NoteGPT, this tool provides instant transcript generation, AI summaries, key point extraction, and multi-format export.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-%3E%3D18.0.0-blue.svg)

## 🎯 Features

### Core Functionality
- ✅ **Instant Transcript Extraction** - Extract full transcripts from any YouTube video
- ✅ **Timestamp Support** - Each line includes precise timestamps
- ✅ **Multi-Language** - Support for 10+ languages
- ✅ **Fast Processing** - Sub-second response times

### AI-Powered Analysis
- ✅ **Auto-Generated Summaries** - Brief, detailed, or bullet-point summaries
- ✅ **Key Points Extraction** - Automatically identify main ideas
- ✅ **Flashcard Generation** - Create study materials automatically
- ✅ **Q&A Functionality** - Ask questions about the video content

### Export Options
- ✅ **TXT Export** - Plain text format
- ✅ **PDF Export** - Professional formatted PDF
- ✅ **DOCX Export** - Editable Word documents
- ✅ **Clipboard Copy** - One-click copy to clipboard

### User Experience
- ✅ **Responsive Design** - Works on all devices
- ✅ **Real-time Updates** - Live progress updates via WebSocket
- ✅ **Search Functionality** - Find text within transcripts
- ✅ **Modern SaaS UI** - Clean, professional interface

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Beautiful icons
- **Axios** - HTTP client
- **Socket.io** - Real-time communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **OpenAI API** - AI-powered analysis
- **YouTube Data API** - Video metadata
- **youtube-transcript** - Transcript extraction

### Database (Optional)
- MongoDB - Store history and user preferences

## 📋 Quick Start

### Prerequisites
- Node.js 16+ and npm 8+
- Google API Key (YouTube Data API v3)
- OpenAI API key

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/youtube-transcript-generator.git
   cd youtube-transcript-generator
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your API keys
   npm run dev
   ```

3. **Frontend Setup** (new terminal):
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the Application**:
   Open http://localhost:3000 in your browser

## 🔑 Getting API Keys

### YouTube API Key
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable YouTube Data API v3
4. Go to Credentials → Create API Key
5. Copy key to backend `.env`

### OpenAI API Key 
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy key to backend `.env`
4. Ensure you have API credits available
<!--  pranavkumbhar2000 -->

## 📁 Project Structure

```
youtube-transcript-generator/
├── frontend/                    # React application
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── api/               # API client
│   │   ├── App.js             # Main component
│   │   └── index.js           # Entry point
│   ├── public/
│   ├── package.json
│   ├── tailwind.config.js
│   └── README.md
│
├── backend/                     # Express API
│   ├── controllers/            # Business logic
│   ├── routes/                 # API routes
│   ├── middleware/             # Express middleware
│   ├── utils/                  # Helper functions
│   ├── server.js              # Main server
│   ├── package.json
│   └── README.md
│
├── README.md                    # This file
└── .gitignore
```

## 🚀 Usage

### Basic Workflow
1. **Paste YouTube URL** - Enter any YouTube video link
2. **Select Language** - Choose the subtitle language (optional)
3. **Click Generate** - System extracts the transcript
4. **View Transcript** - Search and review the full text
5. **Use AI Features** - Generate summaries, key points, flashcards
6. **Export** - Download in your preferred format

### API Usage Example

```javascript
// Fetch transcript
const response = await axios.post('http://localhost:5000/api/transcript/fetch', {
  url: 'https://www.youtube.com/watch?v=VIDEO_ID',
  language: 'en'
});

// Generate summary
const summary = await axios.post('http://localhost:5000/api/ai/summarize', {
  transcript: response.data.transcript,
  language: 'en',
  summaryType: 'brief'
});

// Export as PDF
const pdf = await axios.post('http://localhost:5000/api/export/pdf', {
  transcript: response.data.transcript,
  fileName: 'my-transcript'
}, { responseType: 'blob' });
```

## 🔧 Configuration

### Environment Variables

**Backend (.env)**:
```env
PORT=5000
NODE_ENV=development
YOUTUBE_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/transcript-generator
```

**Frontend (.env)**:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📊 API Endpoints

### Transcript Extraction
- `POST /api/transcript/fetch` - Extract transcript
- `POST /api/transcript/languages` - Get available languages
- `GET /api/transcript/metadata/:videoId` - Get video info

### AI Features
- `POST /api/ai/summarize` - Generate summary
- `POST /api/ai/keypoints` - Extract key points
- `POST /api/ai/flashcards` - Create flashcards
- `POST /api/ai/question` - Answer questions

### Export
- `POST /api/export/text` - Export as TXT
- `POST /api/export/pdf` - Export as PDF
- `POST /api/export/docx` - Export as DOCX

## 🚢 Deployment

### Deploy Backend

#### With Railway
```bash
# Connect GitHub repo to Railway
# Set environment variables in Railway dashboard
# Auto-deploys on push
```

#### With Heroku
```bash
heroku login
heroku create your-app-name
heroku buildpacks:add heroku/nodejs
git push heroku main
heroku config:set YOUTUBE_API_KEY=your_key
heroku config:set OPENAI_API_KEY=your_key
```

### Deploy Frontend

#### With Vercel
```bash
npm install -g vercel
vercel
# Follow prompts
# Set REACT_APP_API_URL env var to your backend URL
```

#### With Netlify
```bash
netlify deploy --prod --dir=build
```

## 🧪 Testing

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 🐛 Troubleshooting

### Common Issues

**"Cannot fetch transcript"**
- Check if YouTube video has captions enabled
- Verify YouTube API key is valid
- Check if video owner disabled captions

**"OpenAI API error"**
- Verify API key is correct
- Check account has sufficient credits
- Check rate limits haven't been exceeded

**"CORS error"**
- Ensure backend CORS is configured correctly
- Check FRONTEND_URL in backend .env
- Clear browser cache

**"Blank page on frontend"**
- Check if backend server is running
- Verify API URL is correct
- Check browser console for errors

See [Backend README](./backend/README.md) and [Frontend README](./frontend/README.md) for more details.

## 📈 Performance Optimizations

- **Caching**: Transcripts cached for 1 hour
- **Code Splitting**: React components split by route
- **Compression**: GZIP compression enabled
- **CDN**: Use CDN for static assets
- **Database Indexing**: MongoDB indexes on frequently queried fields

## 🔐 Security

- **API Key Protection**: Never commit API keys
- **CORS**: Configured to allow frontend only
- **Input Validation**: All inputs validated server-side
- **Rate Limiting**: Can be added via middleware
- **HTTPS**: Use HTTPS in production

## 📄 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 💡 Future Features

- [ ] User authentication & dashboard
- [ ] Transcript history storage
- [ ] Advanced search & filtering
- [ ] Manual transcript editing
- [ ] Batch processing
- [ ] Browser extension
- [ ] Dark mode
- [ ] More AI features (Q&A chat)
- [ ] Collaborative sharing
- [ ] Custom styling options

## 📞 Support

- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Ask questions in Discussions
- **Email**: contact@yourdomain.com

## 🌟 Acknowledgments

- Built with React, Express, and modern web technologies
- Inspired by NoteGPT and similar tools
- Powered by OpenAI and YouTube APIs

---

**Made with ❤️ for content creators and learners**
