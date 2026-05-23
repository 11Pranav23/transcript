import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from utils.youtube_handler import download_youtube_audio

print("Downloading audio...")
res = download_youtube_audio("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
print("Result path:", res)
if res and os.path.exists(res):
    print("Downloaded successfully. File size:", os.path.getsize(res))
    os.remove(res)
else:
    print("Download failed!")
