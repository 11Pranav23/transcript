# Smart Transcript Hub - Frontend Guide

## 🌐 Quick Start

### Running the Frontend

The frontend is a single HTML file that can be served using any simple HTTP server.

#### Option 1: Python (Recommended)
```bash
cd smart-hub-frontend

# Python 3.x
python -m http.server 8000

# Then open: http://localhost:8000
```

#### Option 2: Node.js (http-server)
```bash
cd smart-hub-frontend

npm install -g http-server
http-server

# Then open: http://localhost:8080
```

#### Option 3: Simple Directory Serve
```bash
# Just open index.html in your browser
# File → Open File → index.html
```

---

## 🎨 Features

### 1. YouTube URL Transcription
- Paste YouTube URL
- Auto-fetches transcript from YouTube Captions API
- Falls back to Whisper if captions not available
- Language selection support

### 2. File Upload
- Drag & drop audio/video files
- Supported formats:
  - Audio: MP3, WAV, M4A, FLAC, OGG, WebM
  - Video: MP4 (audio extracted automatically)
- Max file size: 500MB

### 3. Live Recording
- Record audio directly from microphone
- WebRTC-based (works in all modern browsers)
- Real-time transcription

### 4. Export Options
- **TXT** - Plain text format
- **SRT** - Subtitle format (with timestamps)
- **VTT** - Video Text Tracks format
- **PDF** - Professional PDF document
- **Copy** - Copy to clipboard

### 5. Language Features
- Automatic language detection
- Translation to multiple languages
- Multilingual support (12+ languages)

### 6. Text Analysis
- Word count
- Character count
- Reading time estimation
- Top keywords extraction
- Frequency analysis

---

## 🖥️ UI Components

### Tab Navigation
The interface is organized into 4 main tabs:

1. **📺 YouTube URL** - Fetch transcripts from YouTube videos
2. **📁 Upload File** - Upload audio or video files
3. **🎙️ Record Audio** - Record voice directly
4. **📄 Results** - View, analyze, and export transcripts

### Dark Mode Design
- Modern dark theme (inspired by Sanish Tech style)
- Gradient accents (Blue/Purple)
- Smooth animations and transitions
- Responsive design (works on mobile)

### Interactive Elements
- Real-time message notifications
- Loading indicators
- Copy-to-clipboard button
- Keyword highlighting
- Draggable file upload
- Dropdown language selection

---

## 🔌 API Configuration

The frontend connects to the backend API at:
```
http://localhost:5001/api
```

To change the API URL, edit line 389 in `index.html`:
```javascript
const API_BASE_URL = 'http://localhost:5001/api';
```

---

## 📱 Browser Compatibility

The frontend works on:
- ✅ Chrome/Chromium (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Edge (v90+)
- ⚠️ Mobile browsers (with limitations on recording)

The WebRTC recording feature requires:
- HTTPS (or localhost for development)
- Microphone permissions

---

## 🚀 Deployment

### Static Hosting
Since it's just HTML/CSS/JS, you can host it anywhere:

#### Netlify
```bash
# Drag and drop the smart-hub-frontend folder
# Or use Netlify CLI
netlify deploy --prod --dir=smart-hub-frontend
```

#### Vercel
```bash
vercel --prod
```

#### GitHub Pages
```bash
# Push to gh-pages branch
git checkout -b gh-pages
git push origin gh-pages
```

#### AWS S3 + CloudFront
```bash
aws s3 sync smart-hub-frontend s3://your-bucket/
```

---

## 🔒 Security Considerations

1. **CORS**: Backend should be configured for production URLs
2. **API Key**: Keep OpenAI API key on backend only
3. **File Upload**: Validate file types and sizes on backend
4. **Rate Limiting**: Implement rate limiting on backend
5. **HTTPS**: Always use HTTPS in production

---

## ⚙️ Customization

### Change API Base URL
Edit line 389:
```javascript
const API_BASE_URL = 'http://your-api-endpoint.com/api';
```

### Modify Color Scheme
Edit CSS variables at line 16-31:
```css
:root {
    --primary-bg: #0f172a;
    --accent-blue: #3b82f6;
    --accent-purple: #a855f7;
    /* ... */
}
```

### Add New Language
Add to language dropdown (around line 550):
```html
<option value="it">Italian</option>
```

### Change UI Text
All text is hardcoded - just find and replace in the HTML.

---

## 🐛 Troubleshooting

### "Connection refused" error
**Problem:** Backend API not running
**Solution:**
1. Start Flask backend: `cd smart-hub-backend && python app.py`
2. Verify it's running on `http://localhost:5001`

### Recording not working
**Problem:** Microphone permission denied
**Solution:**
1. Check browser microphone permissions
2. Allow access when browser asks
3. Try HTTPS if on production

### File upload not working
**Problem:** Backend can't process file
**Solution:**
1. Check file format is supported
2. Verify file size < 500MB
3. Check FFmpeg is installed on backend

### Transcript not appearing
**Problem:** API returned error
**Solution:**
1. Check browser console (F12) for error details
2. Verify YouTube URL is valid
3. Check API base URL is correct

---

## 📊 Statistics Display

After transcription, the results tab shows:
- **Total Words** - Number of words in transcript
- **Total Characters** - Including spaces
- **Reading Time** - Estimated minutes to read (200 WPM)
- **Top Keywords** - 10 most frequent meaningful words
- **Detected Language** - Auto-detected language code

---

## 📥 Export Formats

### TXT Format
Plain text, one word per line.

### SRT Format
```
1
00:00:00,000 --> 00:00:05,000
This is subtitle one

2
00:00:05,000 --> 00:00:10,000
This is subtitle two
```

### VTT Format
```
WEBVTT

00:00:00.000 --> 00:00:05.000
This is subtitle one

00:00:05.000 --> 00:00:10.000
This is subtitle two
```

### PDF Format
Professional PDF with title, date, and formatted text.

---

## 🌍 Translation Feature

The app can translate transcripts to:
- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Chinese (zh)
- Japanese (ja)
- Arabic (ar)
- And more...

Translation powered by OpenAI API on the backend.

---

## 📈 Performance Tips

1. **Reduce file size** - Compress audio before uploading
2. **Use local files** - Faster than YouTube downloads
3. **Clear cache** - Browser cache can slow things down
4. **Close other tabs** - Frees up system resources
5. **Strong internet** - Required for file uploads

---

## 🔗 Integration Examples

### Embed in Another Site
```html
<iframe src="http://your-server.com/smart-hub-frontend/" 
        width="100%" 
        height="800"></iframe>
```

### API-Only Usage
```javascript
// Call API directly without the UI
const response = await fetch('http://localhost:5001/api/transcript/youtube', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://youtube.com/...' })
});
```

---

## 📝 Code Structure

- **HTML** (lines 1-150) - DOM structure
- **CSS** (lines 150-450) - Styling and animations
- **JavaScript** (lines 450+) - Logic and API calls

Main functions:
- `fetchYouTubeTranscript()` - YouTube fetching
- `uploadFile()` - File upload handling
- `startRecording() / stopRecording()` - Audio recording
- `displayTranscript()` - Show results
- `exportAs()` - Export functionality
- `translateTranscript()` - Translation

---

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console errors (F12)
3. Check backend logs
4. Verify all services are running

---

## 📄 License

MIT License - Feel free to use and modify this frontend.

---

**Happy transcribing!** 🎉
