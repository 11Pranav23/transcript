import axios from 'axios';

async function getTranscriptFallback(videoId, lang='en') {
  try {
    const { data } = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    const match = data.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;/);
    if (!match) throw new Error('No ytInitialPlayerResponse found');

    const playerResponse = JSON.parse(match[1]);
    const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    
    if (!tracks || !tracks.length) throw new Error('No caption tracks found');

    let track = tracks.find(t => t.languageCode === lang);
    if (!track && lang === 'en') {
          track = tracks.find(t => t.languageCode.startsWith('en'));
    }
    if (!track) track = tracks[0];

    const transcriptResponse = await axios.get(track.baseUrl + '&fmt=json3');
    console.log("Response Type:", typeof transcriptResponse.data);
    if (typeof transcriptResponse.data === 'object') {
       console.log("Keys:", Object.keys(transcriptResponse.data));
       console.log("Events array?:", Array.isArray(transcriptResponse.data.events));
       if (transcriptResponse.data.events && transcriptResponse.data.events.length > 0) {
           console.log("First event:", transcriptResponse.data.events[0]);
           console.log("Second event:", transcriptResponse.data.events[1]);
       }
    } else {
       console.log("Snippet:", transcriptResponse.data.substring(0, 500));
    }
    
    return [];

  } catch (err) {
    console.error('Fallback error:', err.message);
    throw err;
  }
}

getTranscriptFallback('dQw4w9WgXcQ', 'en').catch(console.error);
