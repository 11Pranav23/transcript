import { Innertube } from 'youtubei.js';

async function main() {
  const yt = await Innertube.create();
  const info = await yt.getInfo('dQw4w9WgXcQ');
  const transcriptData = await info.getTranscript();
  
  if (transcriptData && transcriptData.transcript) {
    const segments = transcriptData.transcript.content.body.initial_segments;
    console.log(segments.slice(0, 3));
  } else {
    console.log("No transcript available");
  }
}

main().catch(console.error);
