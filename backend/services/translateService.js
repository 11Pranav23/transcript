import translate from 'google-translate-api-x';

export const translateText = async (text, targetLang) => {
  if (!text || !text.trim()) return text;
  
  try {
    const res = await translate(text, { to: targetLang });
    return res.text;
  } catch (error) {
    console.error("[Translate Service] Error translating text:", error.message);
    return text; // Fallback to original
  }
};
