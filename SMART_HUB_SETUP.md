# 🎙️ Smart Transcript Hub - Complete Setup & Run Guide

**AI-Powered Transcription Tool** for YouTube videos, audio files, and live recordings.

> ⚠️ **NOTE**: This is a NEW application separate from the existing YouTube Transcript Generator. 
> It uses Python Flask backend instead of Node.js, and vanilla HTML/CSS/JS frontend instead of React.

---

## 📋 Quick Navigation

- [Features](#features)
- [Installation](#installation)
- [Running the App](#running-the-app)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

---

## ✨ Features

### Input Methods
- 🎥 **YouTube Videos** - Fetch transcripts from captions, fallback to Whisper
- 📁 **File Upload** - Support MP3, WAV, M4A, MP4, and more
- 🎤 **Live Recording** - Record audio directly from browser mic
- 📹 **YouTube Shorts** - Works with Shorts just like regular videos

### Processing
- 🤖 **OpenAI Whisper** - Cloud-based audio transcription
- 🌍 **Language Detection** - Auto-detect 100+ languages
- 🔄 **Translation** - Translate transcripts to any language
- 📊 **Text Analysis** - Word count, keywords, reading time

### Export
- 📄 TXT, SRT, VTT, PDF formats
- 🎯 Timestamp-based subtitles
- 📋 Copy to clipboard

---

## 🎯 System Architecture Comparison

| Feature | Original App | Smart Hub |
|---------|--------------|-----------|
| Backend | Node.js Express | Python Flask |
| Frontend | React | Vanilla HTML/CSS/JS |
| Transcription | Node Whisper API | OpenAI Whisper API |
| Recording | No | WebRTC Support |
| Translation | ChatGPT only | ChatGPT + TextBlob |
| Deployment | NPM | pip + Python |

---

## 💻 Installation

### Prerequisites
1. **Python 3.8+** - [Download here](https://www.python.org/downloads/)
2. **FFmpeg** - [Download here](https://ffmpeg.org/download.html) or:
   ```bash
   # Windows
   choco install ffmpeg
   
   # Mac
   brew install ffmpeg
   
   # Linux
   sudo apt-get install ffmpeg
   ```
3. **OpenAI API Key** - [Get here](https://platform.openai.com/api-keys)

**Verify:**
```bash
python --version      # Should be 3.8+
ffmpeg -version       # Should display version
```

---

### Step 1: Backend Setup

```bash
# Navigate to backend
cd d:\transcript-generator\smart-hub-backend

# Create virtual environment
python -m venv venv

# Activate (choose based on your OS)
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env

# Edit .env - ADD YOUR OPENAI API KEY
# OPENAI_API_KEY=sk-your-key-here

# Create uploads folder
mkdir uploads
```

**Verify Backend:**
```bash
python -c "from flask import Flask; print('✅ Flask OK')"
python -c "from openai import OpenAI; print('✅ OpenAI OK')"
python -c "from youtube_transcript_api import YouTubeTranscriptApi; print('✅ YouTube OK')"
```

---

### Step 2: Frontend Setup

The frontend is just HTML - no build tools needed!

```bash
# Navigate to frontend
cd d:\transcript-generator\smart-hub-frontend

# Serve with Python (no installation needed)
python -m http.server 8000

# In new terminal, verify:
curl http://localhost:8000
# Should return HTML content
```

---

## ▶️ Running the Application

### Method 1: Run Both Services (Recommended)

**Terminal 1 - Backend:**
```bash
cd d:\transcript-generator\smart-hub-backend

# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

# Run Flask
python app.py

# Expected output:
# ✅ Server running on port 5001
```

**Terminal 2 - Frontend:**
```bash
cd d:\transcript-generator\smart-hub-frontend

# Run HTTP server
python -m http.server 8000

# Expected output:
# Serving HTTP on 0.0.0.0 port 8000
```

**Access Application:**
Open browser to: `http://localhost:8000`

---

### Method 2: Docker (Single Command)

```bash
# In smart-hub-backend directory
docker-compose up
```

---

## 🌐 Frontend Usage

### Tab 1: YouTube URL
```
1. Paste YouTube URL
2. Select language (optional)
3. Click "Fetch Transcript"
4. View results in "Results" tab
```

**Supported URLs:**
- `https://youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://youtube.com/shorts/VIDEO_ID`

---

### Tab 2: Upload File
```
1. Drag & drop file or click to browse
2. Supported: MP3, WAV, M4A, MP4, etc.
3. Max size: 500MB
4. Click "Transcribe File"
5. View results
```

---

### Tab 3: Record Audio
```
1. Click "Start Recording"
2. Allow microphone access
3. Speak into mic
4. Click "Stop Recording"
5. Preview and click "Transcribe Recording"
6. View results
```

---

### Tab 4: Results
Shows after transcription:
- Full transcript text (scrollable)
- Word count, character count, reading time
- Top 10 keywords
- Export buttons (TXT, PDF, SRT, VTT)
- Translation dropdown

---

## 📡 API Endpoints

### Base URL
```
http://localhost:5001/api
```

### Endpoints Reference

#### 1. YouTube Transcription
```bash
POST /transcript/youtube
Content-Type: application/json

{
  "url": "https://youtube.com/watch?v=...",
  "language": "en"
}

# Response
{
  "success": true,
  "transcript": "...",
  "plain_text": "...",
  "language": "en",
  "source": "youtube_api",
  "metadata": { ... }
}
```

---

#### 2. File Upload
```bash
POST /transcribe/upload
Content-Type: multipart/form-data

file: <audio.mp3>

# OR for video:
POST /transcribe/video
file: <video.mp4>

# Response
{
  "success": true,
  "transcript": "...",
  "language": "en",
  "duration": 120.5
}
```

---

#### 3. Recording Transcription
```bash
POST /transcribe/recording
Content-Type: multipart/form-data

audio: <audio.wav>

# Response
{
  "success": true,
  "transcript": "...",
  "language": "en"
}
```

---

#### 4. Export
```bash
POST /export/txt
POST /export/srt
POST /export/vtt
POST /export/pdf

{
  "transcript": "full text...",
  "filename": "my_transcript",
  "title": "My Title"
}

# Response: Binary file download
```

---

#### 5. Language Tools
```bash
# Detect language
POST /language/detect
{ "text": "Your text..." }

# Response: { "detected_language": "en", ... }

# Translate
POST /language/translate
{ 
  "text": "Your text...",
  "target_language": "es"
}

# Response: { "translated": "...", ... }
```

---

#### 6. Analysis
```bash
POST /analyze/transcript
{ "transcript": "..." }

# Response:
{
  "word_count": 250,
  "character_count": 1500,
  "estimated_duration_minutes": 1.67,
  "keywords": [
    { "word": "important", "frequency": 5 },
    ...
  ]
}
```

---

## ⚙️ Configuration

### Environment Variables (.env)

```env
# OpenAI Configuration (REQUIRED)
OPENAI_API_KEY=sk-your-api-key-here

# Flask Configuration
FLASK_ENV=development          # or production
FLASK_DEBUG=True               # Set to False in production
SECRET_KEY=your-secret-key

# Server
PORT=5001
HOST=0.0.0.0

# Upload
MAX_FILE_SIZE=500              # MB
UPLOAD_FOLDER=./uploads

# Features (all optional)
ENABLE_YOUTUBE=True
ENABLE_WHISPER=True
ENABLE_RECORDING=True
ENABLE_TRANSLATION=True
ENABLE_PDF_EXPORT=True
```

### Frontend Configuration

Edit `index.html` line ~389:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
// Production:
// const API_BASE_URL = 'https://api.yourdomain.com/api';
```

---

## 🐛 Troubleshooting

### Backend Won't Start

**Error: "No module named 'flask'"**
```bash
# Solution:
pip install -r requirements.txt
```

**Error: "OPENAI_API_KEY" not found**
```bash
# Solution:
# 1. Create .env file in smart-hub-backend/
# 2. Add: OPENAI_API_KEY=sk-your-key
# 3. Restart Flask
```

**Error: "FFmpeg not found"**
```bash
# Solution:
ffmpeg -version
# If not found:
# Windows: choco install ffmpeg
# Mac: brew install ffmpeg
# Linux: sudo apt-get install ffmpeg
```

---

### Frontend Not Loading

**Error: "Cannot GET /"**
```bash
# Solution:
# Make sure you're in smart-hub-frontend directory
cd smart-hub-frontend
python -m http.server 8000
```

**Error: "Connection refused" at localhost:5001**
```bash
# Solution:
# 1. Start backend: cd smart-hub-backend && python app.py
# 2. Verify it shows "Server running on port 5001"
# 3. Check firewall allows port 5001
```

---

### Transcription Issues

**"No captions found"**
- Normal! App will use Whisper instead
- Fallback is automatic

**"File too large"**
- Maximum: 500MB
- Compress first or use shorter file

**"Microphone access denied"**
- Allow access when browser asks
- Check browser microphone permissions
- Try different browser

---

### API Errors

**"413 Request Entity Too Large"**
- File exceeds 500MB limit
- Max file size in `.env` is MAX_FILE_SIZE=500

**"429 Too Many Requests"**
- Hit OpenAI rate limit
- Wait a few minutes or retry

**"Invalid YouTube URL"**
- URL must be public video
- Use format: `https://youtube.com/watch?v=VIDEO_ID`

---

## 📂 Project Structure

```
smart-hub-backend/
├── app.py                      # Main Flask application
├── requirements.txt            # Python dependencies
├── .env                        # Environment variables
├── .env.example                # Example env file
├── README.md                   # Backend documentation
├── uploads/                    # Temporary files
└── utils/
    ├── youtube_handler.py      # YouTube integration
    ├── whisper_handler.py      # OpenAI Whisper API
    ├── file_handler.py         # Audio/video processing
    ├── language_handler.py     # Language detection/translation
    └── export_handler.py       # PDF/SRT/VTT generation

smart-hub-frontend/
├── index.html                  # Complete application
└── README.md                   # Frontend documentation
```

---

## 🚀 Deployment

### Heroku (Backend)

```bash
# Create Procfile in smart-hub-backend/
echo "web: python app.py" > Procfile

# Deploy
heroku create your-app-name
heroku config:set OPENAI_API_KEY=sk-...
git push heroku main

# Update frontend to use:
# https://your-app-name.herokuapp.com/api
```

### AWS Lambda (Backend)

```bash
# Use Zappa for serverless deployment
pip install zappa
zappa init
zappa deploy production
```

### Static Hosts (Frontend)

```bash
# Vercel
vercel smart-hub-frontend

# Netlify
netlify deploy --prod --dir=smart-hub-frontend

# GitHub Pages
git push origin gh-pages
```

---

## 🔐 Security Checklist

- [ ] Never commit `.env` file
- [ ] Use different keys for dev/prod
- [ ] Enable HTTPS in production
- [ ] Set `FLASK_DEBUG=False` in production
- [ ] Use strong `SECRET_KEY`
- [ ] Validate all file uploads
- [ ] Set rate limits on API
- [ ] Use environment variables for secrets
- [ ] Keep dependencies updated: `pip install --upgrade -r requirements.txt`

---

## 📊 Performance Tips

1. **Optimize Audio**: Use 128kbps MP3 instead of high bitrate
2. **Shorter Files**: Split long videos into segments
3. **Local Storage**: Process files locally instead of cloud
4. **Caching**: Cache YouTube transcripts
5. **Batch Processing**: Upload multiple files via API
6. **Monitor Disk**: Clean `uploads/` directory regularly

---

## 🆘 Getting Help

1. **Check logs**: `python app.py` shows errors
2. **Browser console**: F12 → Console tab for frontend errors
3. **Backend docs**: `smart-hub-backend/README.md`
4. **Frontend docs**: `smart-hub-frontend/README.md`
5. **This file**: You're reading it!

---

## 📝 Example Workflows

### Workflow 1: YouTube to PDF

```
1. Tab: YouTube URL
2. Paste: https://youtube.com/watch?v=...
3. Click: Fetch Transcript
4. Tab: Results
5. Click: PDF button
6. Download complete!
```

### Workflow 2: Record and Translate

```
1. Tab: Record Audio
2. Click: Start Recording
3. Speak for 30 seconds
4. Click: Stop Recording
5. Click: Transcribe Recording
6. Tab: Results
7. Select language: Spanish
8. Click: Translate
9. Copy translated text
```

### Workflow 3: Video to Subtitles

```
1. Tab: Upload File
2. Upload: my_video.mp4
3. Click: Transcribe File
4. Tab: Results
5. Click: SRT button
6. Get subtitle file for video
```

---

## 📞 Support Resources

- **OpenAI Docs**: https://platform.openai.com/docs
- **Flask Docs**: https://flask.palletsprojects.com/
- **FFmpeg Guide**: https://ffmpeg.org/documentation.html
- **yt-dlp Repo**: https://github.com/yt-dlp/yt-dlp

---

## 📄 License

MIT License - Use freely for any purpose

---

## 🎉 You're All Set!

You now have a fully functional Smart Transcript Hub!

**Next steps:**
1. Get OpenAI API key
2. Update `.env` file
3. Start backend: `python app.py`
4. Start frontend: `python -m http.server 8000`
5. Open: `http://localhost:8000`
6. Start transcribing!

**Questions?** Check the README files in each folder.

Happy transcribing! 🎙️✨
