# Smart Transcript Hub - Backend Setup Guide

## 🚀 Quick Start

### Prerequisites
- Python 3.8+ (Download from [python.org](https://www.python.org/))
- FFmpeg (required for video/audio processing)
  - **Windows**: Download from [ffmpeg.org](https://ffmpeg.org/download.html) or use `choco install ffmpeg`
  - **Mac**: `brew install ffmpeg`
  - **Linux**: `sudo apt-get install ffmpeg`

### Installation Steps

1. **Navigate to backend directory**
```bash
cd smart-hub-backend
```

2. **Create Python virtual environment**
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Setup environment variables**
```bash
# Copy the example file
cp .env.example .env

# Edit .env and add your OpenAI API key
# Get one from: https://platform.openai.com/api-keys
```

5. **Create uploads directory**
```bash
mkdir uploads
```

6. **Run the Flask server**
```bash
python app.py
```

The API will start on `http://localhost:5001`

---

## 📡 API Endpoints

### Health Check
```bash
GET /api/health
```

### YouTube Endpoints

**Fetch YouTube Transcript**
```bash
POST /api/transcript/youtube
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "language": "en"
}
```

**Check Available Languages**
```bash
GET /api/transcript/youtube/languages?url=https://www.youtube.com/watch?v=...
```

---

### File Upload Endpoints

**Transcribe Audio File**
```bash
POST /api/transcribe/upload
Content-Type: multipart/form-data

file: <audio.mp3>
```

Supported formats: MP3, WAV, M4A, FLAC, OGG, WebM (Max 500MB)

**Transcribe Video File**
```bash
POST /api/transcribe/video
Content-Type: multipart/form-data

file: <video.mp4>
```

---

### Recording Endpoint

**Transcribe Recording**
```bash
POST /api/transcribe/recording
Content-Type: multipart/form-data

audio: <audio.wav>
```

---

### Export Endpoints

**Export as TXT**
```bash
POST /api/export/txt
Content-Type: application/json

{
  "transcript": "Your transcript text...",
  "filename": "transcript"
}
```

**Export as SRT (Subtitles)**
```bash
POST /api/export/srt
Content-Type: application/json

{
  "transcript": "Your transcript text...",
  "filename": "transcript"
}
```

**Export as VTT (Video Text Tracks)**
```bash
POST /api/export/vtt
Content-Type: application/json

{
  "transcript": "Your transcript text...",
  "filename": "transcript"
}
```

**Export as PDF**
```bash
POST /api/export/pdf
Content-Type: application/json

{
  "transcript": "Your transcript text...",
  "title": "My Transcript",
  "filename": "transcript"
}
```

---

### Language Endpoints

**Detect Language**
```bash
POST /api/language/detect
Content-Type: application/json

{
  "text": "Your text here..."
}
```

**Translate Text**
```bash
POST /api/language/translate
Content-Type: application/json

{
  "text": "Your text here...",
  "target_language": "es"
}
```

---

### Analysis Endpoint

**Analyze Transcript**
```bash
POST /api/analyze/transcript
Content-Type: application/json

{
  "transcript": "Your transcript text..."
}
```

Returns:
- Word count
- Character count
- Estimated duration
- Top keywords

---

## 🔧 Environment Variables

Create a `.env` file with:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=True
SECRET_KEY=your-secret-key

# Server Configuration
PORT=5001
HOST=0.0.0.0

# Upload Configuration
MAX_FILE_SIZE=500
UPLOAD_FOLDER=./uploads
```

---

## 📦 Dependencies

- **Flask** - Web framework
- **OpenAI** - Whisper transcription API
- **youtube-transcript-api** - YouTube subtitle fetching
- **yt-dlp** - YouTube audio downloading
- **pydub** - Audio processing
- **librosa** - Audio analysis
- **textblob** - Language detection
- **reportlab** - PDF generation
- **python-pptx** - DOCX generation

---

## 🐛 Troubleshooting

### Issue: FFmpeg not found
**Solution:**
- Verify FFmpeg is installed: `ffmpeg -version`
- Add FFmpeg to system PATH
- Download from [ffmpeg.org](https://ffmpeg.org/download.html)

### Issue: OpenAI API key error
**Solution:**
- Verify API key in `.env` file
- Generate new key at [platform.openai.com](https://platform.openai.com/api-keys)
- Check that your OpenAI account has credits

### Issue: "No captions found" on YouTube
**Solution:**
- The app will automatically fall back to Whisper transcription
- Some videos may not have captions available

### Issue: File too large error
**Solution:**
- Maximum file size is 500MB
- FFmpeg to compress video before uploading
- Use a shorter audio/video file

---

## 📝 Example Usage

### Python Script
```python
import requests

# Fetch YouTube transcript
response = requests.post('http://localhost:5001/api/transcript/youtube', json={
    'url': 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    'language': 'en'
})

data = response.json()
if data['success']:
    print(data['plain_text'])
```

### cURL
```bash
curl -X POST http://localhost:5001/api/transcript/youtube \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.youtube.com/watch?v=dQw4w9WgXcQ","language":"en"}'
```

---

## 🚀 Production Deployment

### Using Gunicorn

```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5001 app:app
```

### Using Docker

Create `Dockerfile`:
```dockerfile
FROM python:3.10-slim

RUN apt-get update && apt-get install -y ffmpeg

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5001", "app:app"]
```

Build and run:
```bash
docker build -t smart-transcript-hub .
docker run -p 5001:5001 -e OPENAI_API_KEY=sk_... smart-transcript-hub
```

---

## 📄 License

MIT License - Feel free to use this project for your needs.

---

## 💡 Tips

1. **For better accuracy:** Use clear audio with minimal background noise
2. **For faster processing:** Upload shorter audio/video files
3. **For multiple languages:** The API auto-detects language
4. **API Rate Limits:** OpenAI has rate limits on Whisper API - handle gracefully
5. **CORS:** Already configured to accept requests from `http://localhost:3000` and other origins

---

## 🔗 Resources

- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [yt-dlp Documentation](https://github.com/yt-dlp/yt-dlp)
- [FFmpeg Guide](https://ffmpeg.org/documentation.html)

---

**Need help?** Check the main README.md in the project root folder.
