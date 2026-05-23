"""
Language detection and translation utilities
"""
from textblob import TextBlob
from openai import OpenAI
import os

client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

# Language codes
LANGUAGE_CODES = {
    'english': 'en',
    'spanish': 'es',
    'french': 'fr',
    'german': 'de',
    'italian': 'it',
    'portuguese': 'pt',
    'russian': 'ru',
    'japanese': 'ja',
    'korean': 'ko',
    'chinese': 'zh',
    'arabic': 'ar',
    'hindi': 'hi',
}

def detect_language(text):
    """
    Detect language of text using TextBlob
    
    Returns: language code (e.g., 'en', 'es', 'fr')
    """
    try:
        if not text or len(text) < 10:
            return 'en'  # Default to English for very short text
        
        blob = TextBlob(text)
        language = blob.detect_language()
        
        return language if language else 'en'
    except Exception as e:
        print(f"Error detecting language: {str(e)}")
        return 'en'  # Default to English

def translate_text(text, target_language='en'):
    """
    Translate text using OpenAI GPT API
    
    Args:
        text: Text to translate
        target_language: Target language code or name
    
    Returns: Translated text
    """
    try:
        if not text:
            return text
        
        # Convert language name to code if needed
        if target_language.lower() in LANGUAGE_CODES:
            target_lang_code = LANGUAGE_CODES[target_language.lower()]
        else:
            target_lang_code = target_language
        
        # Map language codes to full names for better translation
        lang_names = {
            'en': 'English',
            'es': 'Spanish',
            'fr': 'French',
            'de': 'German',
            'it': 'Italian',
            'pt': 'Portuguese',
            'ru': 'Russian',
            'ja': 'Japanese',
            'ko': 'Korean',
            'zh': 'Chinese',
            'ar': 'Arabic',
            'hi': 'Hindi',
        }
        
        target_lang_name = lang_names.get(target_lang_code, target_language)
        
        # Use OpenAI for translation
        response = client.chat.completions.create(
            model='gpt-3.5-turbo',
            messages=[
                {
                    'role': 'system',
                    'content': f'You are a professional translator. Translate the following text to {target_lang_name}. Only provide the translation, no explanations.'
                },
                {
                    'role': 'user',
                    'content': text
                }
            ],
            temperature=0.3
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"Error translating text: {str(e)}")
        return text  # Return original text if translation fails

def translate_text_textblob(text, target_language='en'):
    """
    Simple translation using TextBlob (limited language support)
    """
    try:
        blob = TextBlob(text)
        source_lang = blob.detect_language()
        
        if source_lang == target_language:
            return text
        
        translated = blob.translate(from_lang=source_lang, to_lang=target_language)
        return str(translated)
    except Exception as e:
        print(f"Error in TextBlob translation: {str(e)}")
        return text

def get_supported_languages():
    """Get list of supported languages"""
    return list(LANGUAGE_CODES.keys())

def get_language_name(language_code):
    """Get full language name from code"""
    lang_names = {
        'en': 'English',
        'es': 'Spanish',
        'fr': 'French',
        'de': 'German',
        'it': 'Italian',
        'pt': 'Portuguese',
        'ru': 'Russian',
        'ja': 'Japanese',
        'ko': 'Korean',
        'zh': 'Chinese',
        'ar': 'Arabic',
        'hi': 'Hindi',
    }
    return lang_names.get(language_code, language_code)

def highlight_keywords(text, keywords=None):
    """
    Highlight keywords in text
    
    Args:
        text: Text to process
        keywords: List of keywords to highlight
    
    Returns: Text with HTML markup for highlighting
    """
    try:
        if not keywords:
            return text
        
        highlighted_text = text
        for keyword in keywords:
            # Case-insensitive highlighting
            highlighted_text = highlighted_text.replace(
                keyword,
                f'<mark class="keyword-highlight">{keyword}</mark>'
            )
        
        return highlighted_text
    except Exception as e:
        print(f"Error highlighting keywords: {str(e)}")
        return text

def extract_keywords(text, num_keywords=10):
    """
    Extract top keywords from text
    """
    try:
        from collections import Counter
        
        # Simple approach: most common words (excluding stop words)
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
            'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may',
            'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you',
            'he', 'she', 'it', 'we', 'they', 'what', 'which', 'when', 'where', 'why',
            'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most', 'other',
            'some', 'such', 'no', 'nor', 'not', 'only', 'very', 'just', 'so', 'as'
        }
        
        # Tokenize and filter
        words = [w.lower() for w in text.split() if w.lower() not in stop_words and len(w) > 3]
        
        # Get most common
        keywords = Counter(words).most_common(num_keywords)
        
        return [{'keyword': k[0], 'frequency': k[1]} for k in keywords]
        
    except Exception as e:
        print(f"Error extracting keywords: {str(e)}")
        return []

def get_text_statistics(text):
    """Get comprehensive statistics about text"""
    try:
        # Basic counts
        words = text.split()
        characters = len(text)
        word_count = len(words)
        
        # Average word length
        avg_word_length = characters / word_count if word_count > 0 else 0
        
        # Sentence analysis
        sentences = text.split('.')
        sentence_count = len([s for s in sentences if s.strip()])
        avg_sentence_length = word_count / sentence_count if sentence_count > 0 else 0
        
        # Unique words
        unique_words = len(set(w.lower() for w in words))
        
        # Language
        language = detect_language(text)
        
        return {
            'total_characters': characters,
            'total_words': word_count,
            'unique_words': unique_words,
            'average_word_length': round(avg_word_length, 2),
            'total_sentences': sentence_count,
            'average_sentence_length': round(avg_sentence_length, 2),
            'detected_language': language,
            'reading_time_minutes': round((word_count / 200), 2)  # Assuming 200 WPM
        }
    except Exception as e:
        print(f"Error calculating statistics: {str(e)}")
        return {}
