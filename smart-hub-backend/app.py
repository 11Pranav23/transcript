import os
import json
from datetime import datetime
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
from werkzeug.utils import secure_filename
import traceback

# Load environment variables
load_dotenv()

# Import utility modules
from utils.youtube_handler import get_youtube_transcript, download_youtube_audio
from utils.whisper_handler import transcribe_audio
from utils.file_handler import save_uploaded_file, process_audio_file
from utils.language_handler import detect_language, translate_text
from utils.export_handler import generate_srt, generate_pdf, generate_vtt

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_AUDIO = {'mp3', 'wav', 'm4a', 'flac', 'ogg', 'webm', 'mp4'}
ALLOWED_VIDEO = {'mp4', 'mkv', 'webm', 'avi', 'mov'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename, allowed_types):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in allowed_types

def extract_timestamps(text):
    """Simple timestamp extraction (can be enhanced)"""
    lines = text.split('\n')
    timestamps = []
    for line in lines:
        if '-->' in line:  # VTT/SRT format
            timestamps.append(line)
    return timestamps

@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'online',
        'service': 'Smart Transcript Hub Backend',
        'timestamp': datetime.now().isoformat()
    })

@app.route('/', methods=['GET'])
def index():
    """API documentation"""
    return jsonify({
        'message': 'Smart Transcript Hub API',
        'version': '1.0.0',
        'endpoints': {
            'health': 'GET /api/health',
            'youtube': {
                'transcript': 'POST /api/transcript/youtube',
                'languages': 'GET /api/transcript/youtube/languages?url=...'
            },
            'upload': {
                'audio': 'POST /api/transcribe/upload',
                'video': 'POST /api/transcribe/video'
            },
            'recording': 'POST /api/transcribe/recording',
            'export': {
                'txt': 'POST /api/export/txt',
                'srt': 'POST /api/export/srt',
                'vtt': 'POST /api/export/vtt',
                'pdf': 'POST /api/export/pdf'
            },
            'language': {
                'detect': 'POST /api/language/detect',
                'translate': 'POST /api/language/translate'
            }
        }
    })

# ==================== YOUTUBE ENDPOINTS ====================

@app.route('/api/transcript/youtube', methods=['POST'])
def get_youtube_transcript_endpoint():
    """Fetch transcript from YouTube URL"""
    try:
        data = request.json
        url = data.get('url', '').strip()
        
        if not url:
            return jsonify({'error': 'YouTube URL is required'}), 400
        
        # Try to get transcript from YouTube API
        result = get_youtube_transcript(url)
        
        if result.get('success'):
            return jsonify(result), 200
        else:
            # If no captions, fall back to Whisper
            audio_path = download_youtube_audio(url)
            if audio_path:
                transcript_data = transcribe_audio(audio_path)
                os.remove(audio_path)  # Cleanup
                return jsonify({
                    'success': True,
                    'source': 'whisper_fallback',
                    'transcript': transcript_data.get('text', ''),
                    'language': transcript_data.get('language', 'unknown'),
                    'duration': transcript_data.get('duration', 0)
                }), 200
            else:
                return jsonify({'error': 'Could not process YouTube URL'}), 400
                
    except Exception as e:
        return jsonify({'error': str(e), 'traceback': traceback.format_exc()}), 500

@app.route('/api/transcript/youtube/languages', methods=['GET'])
def check_youtube_languages():
    """Check available captions for YouTube URL"""
    try:
        url = request.args.get('url', '').strip()
        if not url:
            return jsonify({'error': 'URL parameter required'}), 400
        
        from utils.youtube_handler import get_available_languages
        languages = get_available_languages(url)
        
        return jsonify({
            'success': True,
            'url': url,
            'available_languages': languages,
            'has_captions': len(languages) > 0
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== FILE UPLOAD ENDPOINTS ====================

@app.route('/api/transcribe/upload', methods=['POST'])
def upload_audio():
    """Transcribe uploaded audio file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename, ALLOWED_AUDIO):
            return jsonify({
                'error': f'Invalid file type. Allowed: {", ".join(ALLOWED_AUDIO)}'
            }), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Transcribe
        result = transcribe_audio(filepath)
        
        # Detect language
        detected_lang = detect_language(result.get('text', ''))
        
        # Cleanup
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify({
            'success': True,
            'transcript': result.get('text', ''),
            'language': detected_lang,
            'duration': result.get('duration', 0),
            'filename': filename
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/transcribe/video', methods=['POST'])
def upload_video():
    """Upload and transcribe video file"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if not allowed_file(file.filename, ALLOWED_VIDEO):
            return jsonify({'error': 'Invalid video format'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S_')
        filename = timestamp + filename
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        # Extract audio and transcribe
        from utils.file_handler import extract_audio_from_video
        audio_path = extract_audio_from_video(filepath)
        
        result = transcribe_audio(audio_path)
        detected_lang = detect_language(result.get('text', ''))
        
        # Cleanup
        os.remove(filepath)
        os.remove(audio_path)
        
        return jsonify({
            'success': True,
            'transcript': result.get('text', ''),
            'language': detected_lang,
            'duration': result.get('duration', 0)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== RECORDING ENDPOINT ====================

@app.route('/api/transcribe/recording', methods=['POST'])
def transcribe_recording():
    """Transcribe audio recording from WebRTC"""
    try:
        if 'audio' not in request.files:
            return jsonify({'error': 'No audio data provided'}), 400
        
        audio_file = request.files['audio']
        
        # Save temporarily
        filename = f"recording_{datetime.now().strftime('%Y%m%d_%H%M%S')}.wav"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        audio_file.save(filepath)
        
        # Transcribe
        result = transcribe_audio(filepath)
        detected_lang = detect_language(result.get('text', ''))
        
        # Cleanup
        os.remove(filepath)
        
        return jsonify({
            'success': True,
            'transcript': result.get('text', ''),
            'language': detected_lang,
            'duration': result.get('duration', 0)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== EXPORT ENDPOINTS ====================

@app.route('/api/export/txt', methods=['POST'])
def export_txt():
    """Export transcript as TXT"""
    try:
        data = request.json
        transcript = data.get('transcript', '')
        filename = data.get('filename', 'transcript')
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.txt")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(transcript)
        
        return send_file(filepath, as_attachment=True, download_name=f"{filename}.txt")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/srt', methods=['POST'])
def export_srt():
    """Export transcript as SRT subtitle format"""
    try:
        data = request.json
        transcript = data.get('transcript', '')
        filename = data.get('filename', 'transcript')
        
        srt_content = generate_srt(transcript)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.srt")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(srt_content)
        
        return send_file(filepath, as_attachment=True, download_name=f"{filename}.srt")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/vtt', methods=['POST'])
def export_vtt():
    """Export transcript as VTT subtitle format"""
    try:
        data = request.json
        transcript = data.get('transcript', '')
        filename = data.get('filename', 'transcript')
        
        vtt_content = generate_vtt(transcript)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], f"{filename}.vtt")
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(vtt_content)
        
        return send_file(filepath, as_attachment=True, download_name=f"{filename}.vtt")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/export/pdf', methods=['POST'])
def export_pdf():
    """Export transcript as PDF"""
    try:
        data = request.json
        transcript = data.get('transcript', '')
        title = data.get('title', 'Transcript')
        filename = data.get('filename', 'transcript')
        
        pdf_path = generate_pdf(transcript, title, filename)
        
        return send_file(pdf_path, as_attachment=True, download_name=f"{filename}.pdf")
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== LANGUAGE ENDPOINTS ====================

@app.route('/api/language/detect', methods=['POST'])
def detect_language_endpoint():
    """Detect language of text"""
    try:
        data = request.json
        text = data.get('text', '')
        
        if not text:
            return jsonify({'error': 'Text required for language detection'}), 400
        
        language = detect_language(text)
        
        return jsonify({
            'success': True,
            'text': text[:100] + '...' if len(text) > 100 else text,
            'detected_language': language
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/language/translate', methods=['POST'])
def translate_endpoint():
    """Translate text to English"""
    try:
        data = request.json
        text = data.get('text', '')
        target_lang = data.get('target_language', 'en')
        
        if not text:
            return jsonify({'error': 'Text required for translation'}), 400
        
        translated = translate_text(text, target_lang)
        
        return jsonify({
            'success': True,
            'original': text[:100] + '...' if len(text) > 100 else text,
            'translated': translated,
            'target_language': target_lang
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ANALYSIS ENDPOINTS ====================

@app.route('/api/analyze/transcript', methods=['POST'])
def analyze_transcript():
    """Analyze transcript for word count, duration, keywords"""
    try:
        data = request.json
        transcript = data.get('transcript', '')
        
        if not transcript:
            return jsonify({'error': 'Transcript required'}), 400
        
        # Word count
        words = transcript.split()
        word_count = len(words)
        
        # Character count
        char_count = len(transcript)
        
        # Average words per minute (assuming 150 WPM)
        estimated_duration_minutes = word_count / 150
        
        # Extract keywords (simple approach - most common words)
        from collections import Counter
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
            'might', 'must', 'can', 'this', 'that', 'these', 'those'
        }
        
        filtered_words = [w.lower() for w in words if w.lower() not in stop_words and len(w) > 3]
        keywords = Counter(filtered_words).most_common(10)
        
        return jsonify({
            'success': True,
            'word_count': word_count,
            'character_count': char_count,
            'estimated_duration_minutes': round(estimated_duration_minutes, 2),
            'keywords': [{'word': k[0], 'frequency': k[1]} for k in keywords]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ==================== ERROR HANDLERS ====================

@app.errorhandler(413)
def request_entity_too_large(error):
    return jsonify({'error': 'File too large. Maximum size is 500MB'}), 413

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001, host='0.0.0.0')
