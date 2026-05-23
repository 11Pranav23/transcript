# YouTube Transcript Generator - Getting Started

Welcome to the YouTube Transcript Generator! This comprehensive guide will help you set up and run the application.

## 🚀 Quick Setup (5 minutes)

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/youtube-transcript-generator.git
cd youtube-transcript-generator
```

### 2. Get API Keys

**YouTube API Key** (Free):
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Search for "YouTube Data API v3"
4. Click "Create Credentials" → "API Key"
5. Copy your key

**OpenAI API Key** (Paid):
1. Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create new secret key
3. Copy your key

### 3. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your API keys
npm run dev
```

Server will run on: `http://localhost:5000`

### 4. Setup Frontend (New Terminal)
```bash
cd frontend
npm install
npm start
```

App will open on: `http://localhost:3000`

## ✅ Verification

1. **Backend Health Check**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"Server is running"}`

2. **Frontend Loading**:
   - Browser should open to `http://localhost:3000`
   - You should see the TranscriptGPT home page

## 📝 First Test Run

1. Go to YouTube and copy any video URL:
   ```
   https://www.youtube.com/watch?v=dQw4w9WgXcQ
   ```

2. Paste in input field on the tool
3. Click "Generate Transcript"
4. Wait for transcript to load
5. Try exporting or generating summary

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check if port 5000 is in use
lsof -i :5000  # On Mac/Linux
netstat -ano | findstr :5000  # On Windows

# Kill process if needed
kill -9 <PID>
```

### Frontend shows blank page
- Clear cache: `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
- Check backend is running
- Check console for errors (`F12`)

### API errors in console
- Verify API keys in `.env`
- Check YouTube video actually has captions
- Ensure API key has sufficient quota

### CORS errors
- Make sure `FRONTEND_URL` in backend `.env` is correct
- Default should be `http://localhost:3000`

## 📚 Documentation

- [Backend README](./backend/README.md) - API details and deployment
- [Frontend README](./frontend/README.md) - UI components and styling
- [Main README](./README.md) - Full project overview

## 🌐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
YOUTUBE_API_KEY=sk-...
OPENAI_API_KEY=sk-...
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 📂 Project Structure Overview

```
transcript-generator/
├── backend/                 # Node.js + Express API
│   ├── controllers/        # Business logic
│   ├── routes/            # API endpoints
│   ├── middleware/        # Express middleware
│   ├── .env.example       # Copy to .env
│   └── server.js          # Main server file
│
├── frontend/              # React application
│   ├── src/
│   │   ├── pages/        # Page components
│   │   ├── components/   # UI components
│   │   ├── api/          # API calls
│   │   └── App.js        # Main component
│   ├── public/           # Static files
│   ├── .env.example      # Copy to .env
│   └── package.json      # Dependencies
│
└── README.md             # This guide
```

## 🎯 Next Steps

1. **Explore the Code**:
   - Frontend components in `frontend/src/pages/`
   - Backend routes in `backend/routes/`

2. **Customize**:
   - Modify colors in `frontend/tailwind.config.js`
   - Add more AI features in `backend/controllers/aiController.js`
   - Add authentication (coming soon)

3. **Deploy**:
   - Backend: Railway, Heroku, or serverless
   - Frontend: Vercel, Netlify, or GitHub Pages

## 💡 Usage Tips

1. **Search in Transcripts**: Use the search box to find specific parts
2. **Export Options**: Download as TXT for editing, PDF for sharing, DOCX for collaboration
3. **AI Features**: Require valid OpenAI API key with sufficient credits
4. **Language Support**: Select language before generating transcript

## 🆘 Getting Help

- Check [Backend README](./backend/README.md) for API issues
- Check [Frontend README](./frontend/README.md) for UI problems
- Review console errors (`F12` on browser)
- Check environment variables are set correctly

## 📚 Learning Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [OpenAI API Docs](https://platform.openai.com/docs)
- [YouTube Data API](https://developers.google.com/youtube/v3)

## 🎓 Debugging Tips

1. **Backend Logs**: Check terminal running `npm run dev`
2. **Frontend Console**: Press `F12` → Console tab
3. **Network Debugging**: F12 → Network tab to see API calls
4. **Redux DevTools**: Install browser extension for state debugging

## ✨ Features to Try

- Paste different YouTube URLs
- Try different languages
- Generate summaries (requires OpenAI key)
- Export in different formats
- Search within transcripts

## 🔗 Useful Links

- [YouTube Data API Setup](https://developers.google.com/youtube/registering_an_application)
- [OpenAI API Keys](https://platform.openai.com/account/api-keys)
- [Heroku Deployment](https://devcenter.heroku.com/)
- [Vercel Documentation](https://vercel.com/docs)

---

**Happy coding! 🚀**
