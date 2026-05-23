import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const summarizeTranscript = async (req, res, next) => {
  try {
    const { transcript, language = 'en', summaryType = 'brief' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const summaryPrompts = {
      brief: 'Please provide a brief 2-3 sentence summary of the following transcript:',
      detailed: 'Please provide a detailed summary with key points of the following transcript:',
      bullets: 'Please summarize the following transcript as bullet points:'
    };

    const prompt = summaryPrompts[summaryType] || summaryPrompts.brief;

    req.io?.emit('progress', { status: 'Generating summary...', progress: 20 });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at summarizing video transcripts in ${language}. Be concise and clear.`
        },
        {
          role: 'user',
          content: `${prompt}\n\n${transcript.substring(0, 4000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    req.io?.emit('progress', { status: 'Summary completed', progress: 100 });

    res.json({
      success: true,
      summary: completion.choices[0].message.content,
      summaryType,
      language
    });

  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to generate summary. Please check your API key.' });
  }
};

export const extractKeyPoints = async (req, res, next) => {
  try {
    const { transcript, language = 'en' } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    req.io?.emit('progress', { status: 'Extracting key points...', progress: 20 });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an expert at extracting key points from transcripts. Return as a JSON array of strings.`
        },
        {
          role: 'user',
          content: `Extract 5-7 key points from this transcript in ${language}:\n\n${transcript.substring(0, 4000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    req.io?.emit('progress', { status: 'Key points extracted', progress: 100 });

    let keyPoints = [];
    try {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        keyPoints = JSON.parse(jsonMatch[0]);
      } else {
        keyPoints = content.split('\n').filter(line => line.trim());
      }
    } catch (parseError) {
      keyPoints = completion.choices[0].message.content.split('\n').filter(line => line.trim());
    }

    res.json({
      success: true,
      keyPoints,
      language
    });

  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to extract key points' });
  }
};

export const generateFlashcards = async (req, res, next) => {
  try {
    const { transcript, language = 'en', count = 5 } = req.body;

    if (!transcript) {
      return res.status(400).json({ error: 'Transcript text is required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    req.io?.emit('progress', { status: 'Generating flashcards...', progress: 20 });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `Generate ${count} learning flashcards with questions and answers from the transcript. Format as JSON array with objects containing 'question' and 'answer' keys.`
        },
        {
          role: 'user',
          content: `Create ${count} flashcards in ${language} from this transcript:\n\n${transcript.substring(0, 4000)}`
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    });

    req.io?.emit('progress', { status: 'Flashcards created', progress: 100 });

    let flashcards = [];
    try {
      const content = completion.choices[0].message.content;
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        flashcards = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
    }

    res.json({
      success: true,
      flashcards: flashcards.slice(0, count),
      count: flashcards.length
    });

  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
};

export const answerQuestion = async (req, res, next) => {
  try {
    const { transcript, question, language = 'en' } = req.body;

    if (!transcript || !question) {
      return res.status(400).json({ error: 'Transcript and question are required' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are an assistant that answers questions based on video transcripts. Answer in ${language}. Be concise and accurate.`
        },
        {
          role: 'user',
          content: `Based on this transcript:\n\n${transcript.substring(0, 3000)}\n\nQuestion: ${question}`
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    res.json({
      success: true,
      answer: completion.choices[0].message.content,
      question
    });

  } catch (error) {
    console.error('OpenAI Error:', error.message);
    res.status(500).json({ error: 'Failed to answer question' });
  }
};
