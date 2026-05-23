"""
OpenAI Whisper API transcription handler
"""
import os
from openai import OpenAI
from datetime import datetime

# Initialize OpenAI client
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

SUPPORTED_FORMATS = ['mp3', 'wav', 'm4a', 'flac', 'ogg', 'webm']

def transcribe_audio(file_path, language=None):
    """
    Transcribe audio using OpenAI Whisper API
    
    Args:
        file_path: Path to audio file
        language: Language code (optional)
    
    Returns:
        dict: transcription result with text, language, duration
    """
    try:
        if not os.path.exists(file_path):
            return {
                'success': False,
                'error': 'Audio file not found'
            }
        
        file_size = os.path.getsize(file_path)
        if file_size > 25 * 1024 * 1024:  # 25MB limit for Whisper API
            return {
                'success': False,
                'error': 'File too large. Maximum size is 25MB'
            }
        
        # Verify file format
        file_ext = os.path.splitext(file_path)[1].lstrip('.').lower()
        if file_ext not in SUPPORTED_FORMATS:
            return {
                'success': False,
                'error': f'Unsupported format. Supported: {", ".join(SUPPORTED_FORMATS)}'
            }
        
        # Open file and send to Whisper API
        with open(file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model='whisper-1',
                file=audio_file,
                language=language,
                response_format='verbose_json'
            )
        
        return {
            'success': True,
            'text': transcript.text,
            'language': transcript.language,
            'duration': transcript.duration if hasattr(transcript, 'duration') else 0,
            'source': 'whisper_api'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Whisper transcription failed: {str(e)}'
        }

def transcribe_with_spoken_language_detection(file_path):
    """
    Transcribe with automatic language detection
    """
    try:
        if not os.path.exists(file_path):
            return {
                'success': False,
                'error': 'Audio file not found'
            }
        
        with open(file_path, 'rb') as audio_file:
            transcript = client.audio.transcriptions.create(
                model='whisper-1',
                file=audio_file
            )
        
        # Get language detection
        transcript_verbose = client.audio.transcriptions.create(
            model='whisper-1',
            file=audio_file,
            response_format='verbose_json'
        )
        
        return {
            'success': True,
            'text': transcript_verbose.text,
            'language': transcript_verbose.language,
            'duration': transcript_verbose.duration if hasattr(transcript_verbose, 'duration') else 0,
            'source': 'whisper_api'
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': f'Transcription with language detection failed: {str(e)}'
        }

def get_supported_formats():
    """Get list of supported audio formats"""
    return SUPPORTED_FORMATS
