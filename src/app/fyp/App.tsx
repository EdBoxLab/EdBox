import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Feed } from './hooks/Feed';
import { Header } from './hooks/Header';
import type { UserStats, FeedItem, ArticleFeedItem, VideoFeedItem, QuizFeedItem, ChallengeFeedItem, FactFeedItem, Feedback, AudioGenerationState, StoryFeedItem, ImageGenerationState } from './types';
import { ArticleView } from './hooks/ArticleView';
import { GoogleGenAI, Type, Modality, GenerateContentResponse } from '@google/genai';
import { InterestSelector } from './hooks/InterestSelector';
import { SpinnerIcon } from './MediaIcons';
import { GenieResponseView } from './hooks/GenieResponseView';

const welcomeCard: ArticleFeedItem = {
  id: 'welcome-card',
  type: 'article',
  xp_reward: 10,
  genie_reaction: 'wink',
  theme: 'purple-gradient',
  title: 'Welcome to your EdBox FYP!',
  summary: 'Your personalized learning journey starts now. Swipe up to explore, swipe left to skip, and ask Genie for help anytime!',
  full_article_content: `Welcome to EdBox! Here's a quick guide to get you started:

- **Explore Your Feed:** Just like your favorite social apps, swipe up to move to the next card. Each card is a bite-sized piece of knowledge tailored to your interests.

- **Interact & Earn:**
  - **Swipe Right (or tap 'Got it!'):** If you understand a concept, swipe it right to earn XP and EdCoins.
  - **Swipe Left:** Not interested? Swipe left to skip. This helps us learn what you don't like.
  - **Quizzes & Challenges:** Answer correctly to build up your daily streak for bonus XP!

- **Go Deeper:**
  - On article cards, tap 'Read More' to dive into the full content, with interactive terms and mini-quizzes.
  - You can also listen to article summaries and save them for later.

- **Ask Genie:**
  - See the purple magic icon? Tap it anytime you're curious! Genie can explain concepts, provide more details, or give you hints.

Your feed will adapt to your interactions. The more you learn, the smarter it gets. Happy learning!`,
  imageGenerationState: 'ready',
  feedback: null,
};


// Audio decoding helpers from @google/genai documentation
function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}


/**
 * Wraps a promise with a timeout.
 */
const generateWithTimeout = <T,>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error(`API call timed out after ${timeoutMs}ms`));
        }, timeoutMs);

        promise.then(
            (res) => {
                clearTimeout(timeoutId);
                resolve(res);
            },
            (err) => {
                clearTimeout(timeoutId);
                reject(err);
            }
        );
    });
};


// Schema for a single feed item object
const singleItemSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING, description: "A unique identifier string, e.g., 'card11'." },
        type: { type: Type.STRING, enum: ['quiz', 'video', 'article', 'challenge', 'fact', 'story'] },
        xp_reward: { type: Type.INTEGER },
        genie_reaction: { type: Type.STRING, enum: ['cheer', 'wink', 'hint', 'hype', 'default', 'sad'] },
        theme: { type: Type.STRING, enum: ['purple-gradient', 'blue-gradient', 'green-gradient', 'orange-gradient', 'red-gradient'] },
        title: { type: Type.STRING },
        // Story
        slides: {
            type: Type.ARRAY,
            description: "Required for 'story' type. An array of 5-20 slide objects.",
            items: {
                type: Type.OBJECT,
                properties: {
                    text: { type: Type.STRING, description: "A short paragraph of the story for this slide." },
                    image_prompt: { type: Type.STRING, description: "A detailed, visually rich prompt for an image that illustrates the text. IMPORTANT: The prompt MUST instruct the model to render the 'text' value clearly and legibly onto the image itself." }
                },
                required: ["text", "image_prompt"]
            }
        },
        // Quiz
        options: { type: Type.ARRAY, items: { type: Type.STRING } },
        answer: { type: Type.STRING },
        streak_bonus: { type: Type.BOOLEAN },
        // Video
        prompt: { type: Type.STRING, description: "Required for 'video' type. A prompt for video generation." },
        placeholder_image_prompt: { type: Type.STRING, description: "Required for 'video' type. A visually descriptive prompt for generating a placeholder image." },
        // Quiz, Article, Challenge, Fact
        image_prompt: { type: Type.STRING, description: "Optional for quiz/article/challenge, required for fact. A visually descriptive prompt for an image related to the card's content." },
        // Article
        summary: { type: Type.STRING },
        full_article_content: { 
            type: Type.STRING,
            description: "2-3 paragraphs. MUST embed interactive elements: `{Term|Definition}` for definitions and `[QUIZ:Question|Opt1,Opt2,Opt3|Correct Answer]` for mini-quizzes."
        },
        // Challenge
        question: { type: Type.STRING },
        time_limit: { type: Type.INTEGER },
        // Fact
        explanation: { type: Type.STRING, description: "Required for 'fact' type. A short, engaging explanation of the fact."}
    },
    required: ["id", "type", "xp_reward", "genie_reaction", "theme", "title"]
};

// New schema for multiple items
const multiItemSchema = {
    type: Type.OBJECT,
    properties: {
        feed_items: {
            type: Type.ARRAY,
            description: "An array of unique feed item objects.",
            items: singleItemSchema
        }
    },
    required: ["feed_items"]
};


/**
 * Attempts to parse a JSON string. If it fails, it asks the Gemini API to repair it.
 * This provides a robust fallback for malformed JSON responses.
 */
const parseOrRepairJson = async (text: string, ai: any): Promise<any> => {
    try {
        // First, attempt to parse the string as-is.
        return JSON.parse(text);
    } catch (error) {
        console.warn("Initial JSON.parse failed. Attempting to repair with Gemini.", { originalText: text, error });
        
        // If parsing fails, create a prompt to ask Gemini to fix the JSON.
        const prompt = `
        The following text is a malformed JSON string. Please correct any syntax errors (e.g., missing commas, unescaped double quotes, trailing commas) and return ONLY the raw, valid JSON object. Do not add any explanatory text, markdown fences, or other wrappers.

        Malformed string:
        ${text}
        `;
        
      // corrected code
try {
  // Call the API with the repair prompt.
  const result = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
  });
  
  const repairedText = result.text?.trim();

  if (repairedText) {
      // Attempt to parse the repaired text.
      return JSON.parse(repairedText);
  } else {
      throw new Error("Gemini repair API returned empty or undefined text.");
  }
} catch (repairError) {
  console.error("Failed to repair and parse JSON.", { repairError, originalText: text });
  // If even the repair fails, re-throw the actual API error to be handled by the caller.
  throw repairError;
}

    }
};

const App: React.FC = () => {
  const [userStats, setUserStats] = useState<UserStats>({
    xp: 1250,
    edCoins: 500,
    streak: 3,
  });
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [viewingArticle, setViewingArticle] = useState<ArticleFeedItem | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const [hasSelectedInterests, setHasSelectedInterests] = useState(false);
  const [userInterests, setUserInterests] = useState<string[]>([]);
  const [positiveInteractionTopics, setPositiveInteractionTopics] = useState<string[]>([]);
  const [negativeInteractionTopics, setNegativeInteractionTopics] = useState<string[]>([]);

  const [genieSelectedItem, setGenieSelectedItem] = useState<FeedItem | null>(null);
  const [genieExplanation, setGenieExplanation] = useState<string>('');
  const [isGenieLoading, setIsGenieLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [summaryAudio, setSummaryAudio] = useState<Record<string, { state: AudioGenerationState, buffer?: AudioBuffer }>>({});
  
  const backgroundLoopController = useRef<{ running: boolean, stop: boolean }>({ running: false, stop: false });

  const handleApiError = useCallback((error: any, context: string) => {
    console.error(`API Error during ${context}:`, error);
    
    setFetchError(`An error occurred during ${context}. Please try again later.`);
    setTimeout(() => setFetchError(null), 5000);

    setIsFetchingMore(false);
    setIsGenieLoading(false);

    if (backgroundLoopController.current) {
        backgroundLoopController.current.stop = true;
    }

    setFeedItems(prev =>
        prev.map(fi => {
            const item = { ...fi };
            if (item.type === 'video' && 'generationState' in item && item.generationState === 'generating') {
                item.generationState = 'error';
            }
            if ('imageGenerationState' in item && item.imageGenerationState === 'generating') {
                item.imageGenerationState = 'error';
            }
            if (item.type === 'story') {
                const newSlides = item.slides.map(slide => {
                    if (slide.imageGenerationState === 'generating') {
                        return { ...slide, imageGenerationState: 'error' as const };
                    }
                    return slide;
                });
                item.slides = newSlides;
            }
            return item;
        })
    );
  }, []);

  const generatePlaceholderForItem = useCallback(async (item: VideoFeedItem): Promise<void> => {
    setFeedItems(prev =>
      prev.map(fi => (fi.id === item.id ? { ...fi, placeholderGenerationState: 'generating' as const } : fi))
    );

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: item.placeholder_image_prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const base64ImageBytes = part.inlineData.data; // inferred as string
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
          setFeedItems(prev =>
              prev.map(fi =>
                fi.id === item.id
                  ? { ...fi, placeholderGenerationState: 'ready' as const, placeholder_image_url: imageUrl }
                  : fi
              )
            );
            return;
          }
        }
      }
      const textResponse = response.text?.trim();
      throw new Error(textResponse || "No image data found in response.");

    } catch (error) {
      handleApiError(error, 'placeholder generation');
      setFeedItems(prev =>
        prev.map(fi => (fi.id === item.id ? { ...fi, placeholderGenerationState: 'error' as const } : fi))
      );
    }
  }, [handleApiError]);

  const generateCardImageForItem = useCallback(async (item: QuizFeedItem | ArticleFeedItem | ChallengeFeedItem | FactFeedItem): Promise<void> => {
    if (!item.image_prompt) return;

    setFeedItems(prev =>
      prev.map(fi => (fi.id === item.id ? { ...fi, imageGenerationState: 'generating' as const } : fi))
    );

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: item.image_prompt }],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const base64ImageBytes = part.inlineData.data; // safely narrowed to string
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setFeedItems(prev =>
              prev.map(fi =>
                fi.id === item.id
                  ? { ...fi, imageGenerationState: 'ready' as const, image_url: imageUrl }
                  : fi
              )
            );
            return;
          }
        }
      }
      const textResponse = response.text?.trim();
      throw new Error(textResponse || "No image data found in response.");

    } catch (error) {
       handleApiError(error, 'card image generation');
       setFeedItems(prev =>
        prev.map(fi => (fi.id === item.id ? { ...fi, imageGenerationState: 'error' as const } : fi))
      );
    }
  }, [handleApiError]);
  
  const generateStorySlideImage = useCallback(async (itemId: string, slideIndex: number, imagePrompt: string): Promise<void> => {
    setFeedItems(prev =>
      prev.map(fi => {
        if (fi.id === itemId && fi.type === 'story') {
          const newSlides = [...fi.slides];
          newSlides[slideIndex] = { ...newSlides[slideIndex], imageGenerationState: 'generating' as const };
          return { ...fi, slides: newSlides };
        }
        return fi;
      })
    );

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: imagePrompt }] },
        config: { responseModalities: [Modality.IMAGE] },
      });
      
      const parts = response.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData?.data) {
            const base64ImageBytes = part.inlineData.data; // safely narrowed to string
            const imageUrl = `data:image/png;base64,${base64ImageBytes}`;
            setFeedItems(prev =>
              prev.map(fi => {
                if (fi.id === itemId && fi.type === 'story') {
                  const newSlides = [...fi.slides];
                  newSlides[slideIndex] = {
                    ...newSlides[slideIndex],
                    imageGenerationState: 'ready' as const,
                    image_url: imageUrl,
                  };
                  return { ...fi, slides: newSlides };
                }
                return fi;
              })
            );
          }
        }
        
      }
      const textResponse = response.text?.trim();
      throw new Error(textResponse || "No image data found in response.");

    } catch (error) {
      handleApiError(error, `story slide image generation`);
      setFeedItems(prev =>
        prev.map(fi => {
          if (fi.id === itemId && fi.type === 'story') {
            const newSlides = [...fi.slides];
            newSlides[slideIndex] = { ...newSlides[slideIndex], imageGenerationState: 'error' as const };
            return { ...fi, slides: newSlides };
          }
          return fi;
        })
      );
    }
  }, [handleApiError]);

  useEffect(() => {
    const generatePendingPlaceholders = async () => {
      const pendingPlaceholders = feedItems.filter(
        (item): item is VideoFeedItem =>
          item.type === 'video' && item.placeholderGenerationState === 'pending'
      );

      for (const item of pendingPlaceholders) {
        await generatePlaceholderForItem(item);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };
    generatePendingPlaceholders();
  }, [feedItems, generatePlaceholderForItem]);

  useEffect(() => {
    const generatePendingImages = async () => {
      const tasks: (
        | { type: 'card'; item: QuizFeedItem | ArticleFeedItem | ChallengeFeedItem | FactFeedItem }
        | { type: 'story_slide'; itemId: string; slideIndex: number; imagePrompt: string }
      )[] = [];

      feedItems.forEach(item => {
        if ('imageGenerationState' in item && item.imageGenerationState === 'pending') {
          tasks.push({ type: 'card', item: item as QuizFeedItem | ArticleFeedItem | ChallengeFeedItem | FactFeedItem });
        }
        if (item.type === 'story') {
          item.slides.forEach((slide, index) => {
            if (slide.imageGenerationState === 'pending') {
              tasks.push({
                type: 'story_slide',
                itemId: item.id,
                slideIndex: index,
                imagePrompt: slide.image_prompt,
              });
            }
          });
        }
      });
      
      for (const task of tasks) {
        if (task.type === 'card') {
          await generateCardImageForItem(task.item);
        } else if (task.type === 'story_slide') {
          await generateStorySlideImage(task.itemId, task.slideIndex, task.imagePrompt);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    };
    generatePendingImages();
  }, [feedItems, generateCardImageForItem, generateStorySlideImage]);

  const processAndSetNewItems = useCallback((newItems: FeedItem[]) => {
    if (newItems.length === 0) return;

    setFeedItems(prev => {
      const existingIds = new Set(prev.map(item => item.id));
      const validNewItems = newItems
        .filter(item => item && item.id && !existingIds.has(item.id))
        .map(item => {
          let newItem: FeedItem = { ...item, feedback: null };
          if (newItem.type === 'video') {
            return { ...newItem, generationState: 'pending', placeholderGenerationState: 'pending' } as VideoFeedItem;
          }
          if (newItem.type === 'story') {
              const storyItem = newItem as StoryFeedItem;
              const slidesWithPendingState = storyItem.slides.map(slide => ({
                  ...slide,
                  imageGenerationState: 'pending' as const
              }));
              return { ...storyItem, slides: slidesWithPendingState };
          }
          if ('image_prompt' in newItem && newItem.image_prompt) {
            return { ...newItem, imageGenerationState: 'pending' as ImageGenerationState };
          }
          return newItem;
        });

      if (validNewItems.length > 0) {
        return [...prev, ...validNewItems];
      }
      
      return prev;
    });
  }, []);

  const generateFeedItems = useCallback(async (
    ai: any,
    count: number,
    interests: string[],
    positiveTopics: string[],
    negativeTopics: string[],
    existingIds: string = '',
    existingTitles: string = ''
  ): Promise<FeedItem[] | null> => {
    const positiveSignals = positiveTopics.length > 0 
        ? `The user seems to be enjoying topics related to "${positiveTopics.slice(-5).join('; ')}". You should generate content related to these topics.`
        : 'None yet. Focus on their core interests.';
    const negativeSignals = negativeTopics.length > 0
        ? `They have been skipping or disliking content about "${negativeTopics.slice(-5).join('; ')}". You must avoid these topics.`
        : 'None yet.';

    const prompt = `
    Generate an array of ${count} unique and engaging educational feed item objects for a learning app called EdBox.

    **User Profile & Context:**
    - Core Interests: "${interests.join(', ')}".
    - Recent Positive Signals: ${positiveSignals}
    - Recent Negative Signals: ${negativeSignals}
    - Existing Content Titles: "${existingTitles}". Generate new, different topics.
    - Existing IDs: ${existingIds}. Generate new unique IDs.

    **Strategy:**
    - The ${count} items should cover different topics based on the user's interests and signals.
    - If there are positive signals, HEAVILY FAVOR topics related to them.
    - STRICTLY AVOID topics related to negative signals.
    - **CRITICAL: Ensure a good mix of 'quiz', 'video', 'article', 'challenge', 'fact', and 'story' types across the ${count} items. Do NOT return only one type.**
    
    **Content Rules & Style Guide:**
    - Each item must have a unique ID (e.g., 'card- followed by a number').
    - 'fact' cards MUST have a detailed, visually rich 'image_prompt'.
    - 'video' cards MUST have a 'prompt' for video generation and a separate, detailed 'placeholder_image_prompt'.
    - 'article' cards' 'full_article_content' MUST embed interactive elements: \`{Term|Definition}\` and \`[QUIZ:Question|Opt1,Opt2,Opt3|Correct Answer]\`.
    - 'quiz' & 'challenge' cards MAY have an 'image_prompt'.

    - **'story' cards:** These are the most important. They must be visually stunning and emotionally resonant, like a high-quality Instagram post.
      - They need a 'title' and a 'slides' array (5-10 slides).
      - Each slide object has 'text' and an 'image_prompt'.
      - **Crucial instructions for 'image_prompt':** The prompt must generate a highly artistic, non-literal, and symbolic image that captures the *feeling* of the slide's text.
        - **Style:** Think cinematic, moody, ethereal digital art. Use keywords like "silhouette of a person", "glowing energy", "nebula background", "dramatic lighting", "double exposure effect", "abstract particles".
        - **Text Integration:** The 'image_prompt' MUST instruct the image model to render the slide's 'text' directly and beautifully onto the image. The text should be part of the art itself.
          - **Good Example:** \`"image_prompt": "A silhouette of a person looking at a vast, starry nebula. In the center, the words 'The cosmos is within us' are formed by glowing constellations in a modern, elegant sans-serif font."\`
          - **Bad Example:** \`"image_prompt": "A photo of space with text at the bottom."\`
        - **Goal:** Create an 'Instagram-worthy' image that makes the user feel something and admire the visuals, not just a simple illustration.

    **CRITICAL JSON FORMATTING RULES:**
    1.  **Output MUST be a single, valid JSON object with a single key "feed_items" containing an array of ${count} item objects.** Do not wrap it in markdown \`\`\`json fences or add any explanatory text.
    2.  **ESCAPE ALL DOUBLE QUOTES inside string values.** This is crucial. If you need a double quote inside a string, use a backslash (\\).
        -   **CORRECT EXAMPLE:** \`"title": "Exploring the \\"Ring of Fire\\""\`
        -   **INCORRECT EXAMPLE:** \`"title": "Exploring the "Ring of Fire""\`
    `;

      try {
          const apiCall = ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
              config: {
                  systemInstruction: "You are an expert content creator for a mobile learning application. Your responses must be structured, adhere strictly to the provided JSON schema, and be highly engaging for users.",
                  responseMimeType: 'application/json',
                  responseSchema: multiItemSchema,
              },
          });
          
          const result: any = await generateWithTimeout(apiCall, 15000);
          let jsonText = result?.text?.trim() ?? "";


          if (jsonText.startsWith("```json")) {
            // Remove leading ```json and trailing ```
            jsonText = jsonText.replace(/^```json\s*/, "").replace(/```$/, "").trim();
          } else if (jsonText.startsWith("```")) {
            // Remove leading ``` and trailing ```
            jsonText = jsonText.replace(/^```\s*/, "").replace(/```$/, "").trim();
          }
          
          
          const parsedObject = await parseOrRepairJson(jsonText, ai);
          return parsedObject.feed_items as FeedItem[];
      } catch (error) {
          console.error(`Failed to generate ${count} feed items:`, error);
          throw error;
      }
}, []);

const fetchInitialContent = useCallback(async (interests: string[]) => {
    setFetchError(null);
    setIsFetchingMore(true);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const newItems = await generateFeedItems(ai, 1, interests, [], [], '', '');

        if (!newItems || newItems.length === 0) {
          console.warn("Initial content generation failed, background fetcher will retry.");
          return;
        }
        
        processAndSetNewItems(newItems);
        
    } catch (error) {
        handleApiError(error, "initial content fetch");
    } finally {
        setIsFetchingMore(false);
    }
  }, [generateFeedItems, processAndSetNewItems, handleApiError]);

  const fetchMoreContent = useCallback(async () => {
    if (isFetchingMore) {
        return;
    }
    setIsFetchingMore(true);
    setFetchError(null);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        const existingIds = feedItems.map(item => item.id).join(', ');
        const existingTitles = feedItems.map(item => item.title).join('; ');
        
        const newItems = await generateFeedItems(
            ai,
            3,
            userInterests,
            positiveInteractionTopics,
            negativeInteractionTopics,
            existingIds,
            existingTitles
        );

        if (newItems && newItems.length > 0) {
            processAndSetNewItems(newItems);
        }
    } catch (error) {
        handleApiError(error, "fetching more content");
    } finally {
        setIsFetchingMore(false);
    }
  }, [isFetchingMore, feedItems, userInterests, positiveInteractionTopics, negativeInteractionTopics, processAndSetNewItems, generateFeedItems, handleApiError]);

  const fetchMoreContentRef = useRef(fetchMoreContent);
  useEffect(() => {
    fetchMoreContentRef.current = fetchMoreContent;
  }, [fetchMoreContent]);

  useEffect(() => {
    const TARGET_BUFFER_SIZE = 8;
    const shouldRun = hasSelectedInterests;

    if (shouldRun && !backgroundLoopController.current.running) {
        backgroundLoopController.current = { running: true, stop: false };
        const loop = async () => {
            while (!backgroundLoopController.current.stop) {
                if (feedItems.length < TARGET_BUFFER_SIZE) {
                    await fetchMoreContentRef.current();
                }
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
            backgroundLoopController.current.running = false;
            backgroundLoopController.current.stop = false;
        };
        loop();
    } else if (!shouldRun && backgroundLoopController.current.running) {
        backgroundLoopController.current.stop = true;
    }

    return () => {
        if (backgroundLoopController.current.running) {
            backgroundLoopController.current.stop = true;
        }
    };
  }, [hasSelectedInterests, feedItems.length]);


  const handleGenerateSummaryAudio = async (item: ArticleFeedItem) => {
    if (summaryAudio[item.id]?.state === 'generating' || summaryAudio[item.id]?.state === 'ready') {
        return;
    }
    setSummaryAudio(prev => ({ ...prev, [item.id]: { state: 'generating' } }));
    
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `A brief summary of the article titled: ${item.title}. ${item.summary}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API");
        }
        
        const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const decodedBytes = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedBytes, outputAudioContext, 24000, 1);
        outputAudioContext.close();
        
        setSummaryAudio(prev => ({ ...prev, [item.id]: { state: 'ready', buffer: audioBuffer } }));

    } catch (error) {
        handleApiError(error, "summary audio generation");
        setSummaryAudio(prev => ({ ...prev, [item.id]: { state: 'error' } }));
    }
  };

  const handleInterestsSelected = (interests: string[]) => {
    setUserInterests(interests);
    setHasSelectedInterests(true);
    setFeedItems([welcomeCard]);
    fetchInitialContent(interests);
  };

  const handleCorrectAnswer = useCallback((xp: number, isStreak: boolean) => {
    setUserStats(prev => ({
      ...prev,
      xp: prev.xp + xp + (isStreak ? prev.streak * 10 : 0),
      edCoins: prev.edCoins + Math.floor(xp / 10),
      streak: prev.streak + 1,
    }));
  }, []);

  const handleIncorrectAnswer = useCallback(() => {
    setUserStats(prev => ({
      ...prev,
      streak: 0,
    }));
  }, []);

  const handleSwipe = useCallback((id: string, action: 'skip' | 'got_it' | 'answered', xp?: number) => {
    const swipedItem = feedItems.find(item => item.id === id);
    if (!swipedItem) return;

    if (action === 'got_it' || action === 'answered') {
      setPositiveInteractionTopics(prev => [...prev, swipedItem.title]);
      if (action === 'got_it' && xp) {
        setUserStats(prev => ({
          ...prev,
          xp: prev.xp + xp,
          edCoins: prev.edCoins + Math.floor(xp / 10),
        }));
      }
    } else if (action === 'skip') {
      setNegativeInteractionTopics(prev => [...prev, swipedItem.title]);
      setUserStats(prev => ({
        ...prev,
        streak: 0,
      }));
    }
    
    setFeedItems(prev => prev.filter(item => item.id !== id));

  }, [feedItems]);

  const handleFeedback = useCallback((id: string, feedback: Feedback) => {
    const item = feedItems.find(i => i.id === id);
    if (!item) return;

    setFeedItems(prev => prev.map(fi =>
        fi.id === id ? { ...fi, feedback } : fi
    ));

    if (feedback === 'like') {
        setPositiveInteractionTopics(prev => [...prev, item.title]);
    } else {
        setNegativeInteractionTopics(prev => [...prev, item.title]);
    }
  }, [feedItems]);
  
  const handleViewArticle = (item: ArticleFeedItem) => {
    setViewingArticle(item);
  };

  const handleCloseArticle = () => {
    setViewingArticle(null);
  };

  const handleAskGenie = async (item: FeedItem) => {
    setGenieSelectedItem(item);
    setIsGenieLoading(true);
    setGenieExplanation('');

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
        
        let contentPrompt = '';
        switch (item.type) {
            case 'quiz':
                const quizItem = item as QuizFeedItem;
                contentPrompt = `The user is on a quiz card. The question is: "${quizItem.title}". The options are: ${quizItem.options.join(', ')}. The correct answer is "${quizItem.answer}". Please explain why "${quizItem.answer}" is the correct answer in an encouraging and easy-to-understand way.`;
                break;
            case 'article':
                const articleItem = item as ArticleFeedItem;
                const articleText = articleItem.full_article_content || articleItem.summary;
                contentPrompt = `The user is on an article card titled "${articleItem.title}". Here is the content: "${articleText}". Please summarize the 3 most important key points from this article for easy digestion. Use bullet points.`;
                break;
            case 'video':
                const videoItem = item as VideoFeedItem;
                contentPrompt = `The user is on a video card titled "${videoItem.title}". The video is described as: "${videoItem.prompt}". Please provide a short, engaging textual summary of what this video likely contains, as if you've watched it.`;
                break;
            case 'fact':
                const factItem = item as FactFeedItem;
                contentPrompt = `The user is on a fact card. The fact is: "${factItem.title}". The current explanation is: "${factItem.explanation}". Please elaborate on this fact, providing some extra interesting details, context, or related fun facts.`;
                break;
            case 'challenge':
                 const challengeItem = item as ChallengeFeedItem;
                contentPrompt = `The user is on a challenge card. The riddle is: "${challengeItem.question}". The answer is "${challengeItem.answer}". Please explain the answer to this riddle in a fun and clever way.`;
                break;
            case 'story':
                const storyItem = item as StoryFeedItem;
                const storyText = storyItem.slides.map(s => s.text).join(' ');
                contentPrompt = `The user is on a story card titled "${storyItem.title}". The story is about: "${storyText}". Provide some extra interesting context or a related fact about the main subject of the story.`;
                break;
        }

        const prompt = `You are Genie, a friendly and knowledgeable AI learning companion in the EdBox app. A user has asked for more information about the content they are viewing. Provide a concise, helpful, and engaging response.
        
        Here is the context:
        ${contentPrompt}`;

        const result: GenerateContentResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        setGenieExplanation(result.text ?? "");


    } catch (error) {
        handleApiError(error, "genie explanation");
    } finally {
        setIsGenieLoading(false);
    }
  };

  const handleCloseGenieExplanation = () => {
      setGenieSelectedItem(null);
  };
  
  return (
    <div className="h-screen w-screen bg-black overflow-hidden">
    <div className="relative w-full h-full bg-gray-800 overflow-hidden">
      {!hasSelectedInterests ? (
        <InterestSelector onInterestsSelected={handleInterestsSelected} />
      ) : (
        <>
          <Header stats={userStats} />
          {fetchError && feedItems.length === 0 ? (
              <div className="h-full w-full flex items-center justify-center p-8 text-center">
                  <div className="text-red-400 bg-red-900/30 p-6 rounded-lg">
                      <p className="font-bold text-lg">Oops! Something went wrong.</p>
                      <p className="mt-2">{fetchError}</p>
                  </div>
              </div>
          ) : (
            <Feed
              items={feedItems}
              onCorrectAnswer={handleCorrectAnswer}
              onIncorrectAnswer={handleIncorrectAnswer}
              onSwipe={handleSwipe}
              onViewArticle={handleViewArticle}
              isFetchingMore={isFetchingMore}
              onFeedback={handleFeedback}
              onAskGenie={handleAskGenie}
              isGenieActive={!!genieSelectedItem}
              summaryAudio={summaryAudio}
              onGenerateSummaryAudio={handleGenerateSummaryAudio}
              onAlmostEnd={fetchMoreContent}
            />
          )}
          {fetchError && feedItems.length > 0 && (
              <div className="absolute bottom-24 left-1/2 -translate-x-1/2 w-11/12 max-w-xs bg-red-800/95 text-white text-center text-sm py-2 px-4 rounded-lg shadow-lg z-30 pointer-events-none">
                  {fetchError}
              </div>
          )}
{viewingArticle && <ArticleView item={viewingArticle} onClose={handleCloseArticle} onApiKeyError={() => handleApiError("API key is invalid or missing.", "article audio generation")} />}
{genieSelectedItem && (
            <GenieResponseView
              item={genieSelectedItem}
              explanation={genieExplanation}
              isLoading={isGenieLoading}
              onClose={handleCloseGenieExplanation}
            />
          )}
        </>
      )}
    </div>
  </div>
);
};

export default App;



