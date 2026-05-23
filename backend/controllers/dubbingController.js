import { processDubbing } from '../services/dubbingService.js';

export const generateDub = async (req, res, next) => {
    try {
        const { videoUrl, targetLanguage, socketId } = req.body;

        if (!videoUrl) return res.status(400).json({ error: 'Video URL is required' });
        if (!targetLanguage) return res.status(400).json({ error: 'Target language is required' });

        // Extract video ID (basic regex)
        let videoId = videoUrl;
        const match = videoUrl.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
        if (match) videoId = match[1];

        const audioUrl = await processDubbing(videoId, targetLanguage, socketId, req.io);

        res.json({
            success: true,
            audioUrl: audioUrl
        });

    } catch (error) {
        console.error('[Dubbing Controller] Error:', error);
        res.status(500).json({ error: error.message || 'Error generating dubbing' });
    }
};
