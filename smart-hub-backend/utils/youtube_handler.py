"""
YouTube transcript and audio handling
"""
import re
import os
from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api._errors import NoTranscriptFound, VideoUnavailable
import yt_dlp

def extract_video_id(url):
    """Extract video ID from YouTube URL"""
    patterns = [
        r'(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)',
        r'(?:youtube\.com\/embed\/)([^&\n?#]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None

def get_available_languages(url):
    """Get available caption languages for a YouTube video"""
    try:
        video_id = extract_video_id(url)
        if not video_id:
            return []
        
        transcript_list = YouTubeTranscriptApi().list(video_id)
        
        languages = []
        
        # Manually created transcripts
        for transcript in transcript_list.manually_created_transcripts:
            languages.append({
                'code': transcript.language_code,
                'name': transcript.language,
                'type': 'manual'
            })
        
        # Auto-generated transcripts
        for transcript in transcript_list.generated_transcripts:
            languages.append({
                'code': transcript.language_code,
                'name': transcript.language,
                'type': 'auto-generated'
            })
        
        return languages
    except Exception as e:
        print(f"Error fetching available languages: {str(e)}")
        return []

def get_youtube_transcript(url, language='en'):
    """Fetch transcript from YouTube URL"""
    try:
        video_id = extract_video_id(url)
        
        if not video_id:
            return {
                'success': False,
                'error': 'Invalid YouTube URL'
            }
        
        try:
            # Try to get transcript in specified language
            transcript = YouTubeTranscriptApi().fetch(video_id, languages=[language])
        except NoTranscriptFound:
            # If not available, try English or first available
            try:
                transcript = YouTubeTranscriptApi().fetch(video_id, languages=['en'])
            except NoTranscriptFound:
                # Get first available transcript
                transcript_list = YouTubeTranscriptApi().list(video_id)
                if transcript_list.manually_created_transcripts:
                    transcript = transcript_list.manually_created_transcripts[0].fetch()
                elif transcript_list.generated_transcripts:
                    transcript = transcript_list.generated_transcripts[0].fetch()
                else:
                    return {
                        'success': False,
                        'error': 'No transcripts found for this video'
                    }
        
        # Format transcript with timestamps
        formatted_transcript = []
        plain_text = []
        raw_segments = []
        for entry in transcript:
            timestamp = format_timestamp(entry.start)
            text = entry.text
            formatted_transcript.append(f"[{timestamp}] {text}")
            plain_text.append(text)
            raw_segments.append({
                'text': text,
                'start': entry.start,
                'duration': entry.duration
            })
        
        # Get video metadata
        metadata = get_video_metadata(video_id)
        
        return {
            'success': True,
            'video_id': video_id,
            'transcript': '\n'.join(formatted_transcript),
            'plain_text': ' '.join(plain_text),
            'raw_segments': raw_segments,
            'language': language,
            'source': 'youtube_api',
            'metadata': metadata
        }
        
    except VideoUnavailable:
        return {
            'success': False,
            'error': 'Video is unavailable'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def format_timestamp(seconds):
    """Convert seconds to HH:MM:SS format"""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{secs:02d}"

def get_video_metadata(video_id):
    """Fetch video metadata using yt-dlp"""
    try:
        ydl_opts = {
            'quiet': True,
            'no_warnings': True,
            'extract_flat': 'in_playlist'
        }
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(f'https://www.youtube.com/watch?v={video_id}', download=False)
            
            return {
                'title': info.get('title', 'Unknown'),
                'channel': info.get('uploader', 'Unknown'),
                'duration': info.get('duration', 0),
                'upload_date': info.get('upload_date', 'Unknown'),
                'view_count': info.get('view_count', 0),
                'like_count': info.get('like_count', 0),
                'description': info.get('description', '')[:500]  # First 500 chars
            }
    except Exception as e:
        print(f"Error fetching metadata: {str(e)}")
        return {}

def download_youtube_audio(url):
    """Download audio from YouTube video for Whisper transcription"""
    try:
        video_id = extract_video_id(url)
        if not video_id:
            return None
        
        output_path = os.path.join(os.path.dirname(__file__), '..', 'uploads')
        os.makedirs(output_path, exist_ok=True)
        
        ydl_opts = {
            'format': 'bestaudio/best',
            'postprocessors': [{
                'key': 'FFmpegExtractAudio',
                'preferredcodec': 'mp3',
                'preferredquality': '192',
            }],
            'outtmpl': os.path.join(output_path, f'yt_audio_{video_id}.%(ext)s'),
            'quiet': True,
            'no_warnings': True,
        }

        # Set ffmpeg path if not globally available
        import shutil
        if not shutil.which('ffmpeg'):
            local_ffmpeg_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend', 'node_modules', '@ffmpeg-installer', 'win32-x64'))
            if os.path.exists(os.path.join(local_ffmpeg_dir, 'ffmpeg.exe')):
                ydl_opts['ffmpeg_location'] = local_ffmpeg_dir
        
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            result = ydl.extract_info(url, download=True)
            audio_path = ydl.prepare_filename(result)
            
            # Convert to mp3 if needed
            if audio_path.endswith('.webm') or audio_path.endswith('.m4a'):
                audio_path = audio_path.rsplit('.', 1)[0] + '.mp3'
            
            return audio_path
            
    except Exception as e:
        print(f"Error downloading YouTube audio: {str(e)}")
        return None
