"""
File handling utilities for audio and video processing
"""
import os
import subprocess
import shutil
from pydub import AudioSegment
import librosa
import numpy as np

# Configure ffmpeg path if it's not installed globally
FFMPEG_BINARY = 'ffmpeg'
local_ffmpeg = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'))

if not shutil.which('ffmpeg') and os.path.exists(local_ffmpeg):
    FFMPEG_BINARY = local_ffmpeg
    AudioSegment.converter = local_ffmpeg

def save_uploaded_file(file, upload_folder):
    """Save uploaded file to upload folder"""
    try:
        if not file:
            return None
        
        os.makedirs(upload_folder, exist_ok=True)
        file_path = os.path.join(upload_folder, file.filename)
        file.save(file_path)
        
        return file_path
    except Exception as e:
        print(f"Error saving file: {str(e)}")
        return None

def extract_audio_from_video(video_path):
    """
    Extract audio from video file using ffmpeg
    """
    try:
        if not os.path.exists(video_path):
            return None
        
        audio_path = video_path.rsplit('.', 1)[0] + '.wav'
        
        command = [
            FFMPEG_BINARY,
            '-i', video_path,
            '-vn',  # No video
            '-acodec', 'pcm_s16le',
            '-ar', '16000',  # 16kHz sample rate
            '-ac', '1',  # Mono
            audio_path,
            '-y'  # Overwrite without asking
        ]
        
        subprocess.run(command, check=True, capture_output=True)
        
        return audio_path
        
    except subprocess.CalledProcessError as e:
        print(f"FFmpeg error: {str(e)}")
        return None
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        return None

def convert_audio_format(input_path, output_format='wav'):
    """Convert audio to different format"""
    try:
        if not os.path.exists(input_path):
            return None
        
        audio = AudioSegment.from_file(input_path)
        output_path = input_path.rsplit('.', 1)[0] + f'.{output_format}'
        
        audio.export(output_path, format=output_format)
        
        return output_path
    except Exception as e:
        print(f"Error converting audio: {str(e)}")
        return None

def get_audio_duration(file_path):
    """Get duration of audio file in seconds"""
    try:
        if not os.path.exists(file_path):
            return 0
        
        audio = AudioSegment.from_file(file_path)
        duration_seconds = len(audio) / 1000.0  # Convert milliseconds to seconds
        
        return round(duration_seconds, 2)
    except Exception as e:
        print(f"Error getting audio duration: {str(e)}")
        return 0

def get_audio_info(file_path):
    """Get detailed audio file information"""
    try:
        if not os.path.exists(file_path):
            return {}
        
        # Using librosa for more detailed analysis
        y, sr = librosa.load(file_path)
        
        duration = librosa.get_duration(y=y, sr=sr)
        
        return {
            'duration': round(duration, 2),
            'sample_rate': sr,
            'format': os.path.splitext(file_path)[1].lstrip('.'),
            'file_size': os.path.getsize(file_path),
            'rms_energy': float(np.sqrt(np.mean(y**2)))
        }
    except Exception as e:
        print(f"Error getting audio info: {str(e)}")
        return {}

def process_audio_file(file_path):
    """Process audio file and return information"""
    try:
        if not os.path.exists(file_path):
            return None
        
        # Normalize audio to -3dB
        from pydub.effects import normalize
        audio = AudioSegment.from_file(file_path)
        normalized = normalize(audio)
        
        # Export normalized version
        normalized_path = file_path.rsplit('.', 1)[0] + '_normalized.wav'
        normalized.export(normalized_path, format='wav')
        
        return normalized_path
    except Exception as e:
        print(f"Error processing audio: {str(e)}")
        return file_path

def split_audio_for_processing(file_path, chunk_duration_ms=600000):
    """
    Split audio into chunks for processing (useful for very long files)
    chunk_duration_ms: duration in milliseconds (default 10 minutes)
    """
    try:
        audio = AudioSegment.from_file(file_path)
        chunks = []
        
        for i in range(0, len(audio), chunk_duration_ms):
            chunk = audio[i:i + chunk_duration_ms]
            chunk_path = f"{file_path}_chunk_{i//chunk_duration_ms}.wav"
            chunk.export(chunk_path, format='wav')
            chunks.append(chunk_path)
        
        return chunks
    except Exception as e:
        print(f"Error splitting audio: {str(e)}")
        return [file_path]

def validate_audio_quality(file_path):
    """Validate audio quality for transcription"""
    try:
        info = get_audio_info(file_path)
        
        if info.get('duration', 0) == 0:
            return False, 'Zero duration audio'
        
        if info.get('sample_rate', 0) < 8000:
            return False, 'Sample rate too low (minimum 8kHz)'
        
        return True, 'Audio quality acceptable'
    except Exception as e:
        return False, str(e)
