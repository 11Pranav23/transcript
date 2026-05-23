import { Innertube } from 'youtubei.js';
import fs from 'fs';

async function main() {
  const yt = await Innertube.create();
  const info = await yt.getInfo('dQw4w9WgXcQ');
  
  console.log("Choosing format...");
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  console.log("Format found:", format.mime_type, format.quality);
  
  console.log("Downloading stream...");
  const stream = await info.download({
    type: 'audio',
    quality: 'best'
  });
  
  const fileStream = fs.createWriteStream('test_audio.mp4');
  
  // Pipe the stream to a file
  for await (const chunk of stream) {
    fileStream.write(chunk);
  }
  fileStream.end();
  console.log("Downloaded successfully!");
}

main().catch(console.error);
