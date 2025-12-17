import { GoogleGenAI } from "@google/genai";

// Ideally, this should be initialized with a valid key. 
// For this demo, we assume process.env.API_KEY is available or handled by the user context.
// In a real production app, you might proxy this request.

const getAIClient = () => {
  // Safer access to process.env for browser environments where it might not be polyfilled
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
  if (!apiKey) {
    console.warn("API Key is missing. TTS generation will likely fail.");
  }
  return new GoogleGenAI({ apiKey });
};

// Map UI voice names to valid Gemini API voice names
// Valid names: 'Puck', 'Charon', 'Kore', 'Fenrir', 'Zephyr', 'Aoede'
const VOICE_MAPPING: Record<string, string> = {
  'Kore': 'Kore',
  'Fenrir': 'Fenrir',
  '不羁青年': 'Fenrir',  // Male, Cool -> Fenrir
  '嚣张小姐': 'Kore',    // Female, Confident -> Kore
  '机械战甲': 'Charon',  // Robot/Deep -> Charon
  '热心大婶': 'Aoede',   // Mature Female -> Aoede
  '搞笑大爷': 'Puck',    // Playful -> Puck
  '温润男声': 'Zephyr',  // Gentle Male -> Zephyr
  '温暖闺蜜': 'Kore',    // Friendly Female -> Kore
  '我的数字分身': 'Charon', // Default custom
  'Narrator': 'Puck'
};

// Text to Speech
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAIClient();
  
  // Resolve the API voice name, defaulting to 'Kore' if not found
  const apiVoiceName = VOICE_MAPPING[voiceName] || 'Kore';
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        // Use string 'AUDIO' to avoid runtime enum issues in some browser environments
        responseModalities: ['AUDIO'] as any, 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: apiVoiceName },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];

    if (!candidate) {
        throw new Error("No candidates returned from API. Please check your API Key and Quota.");
    }
    
    // Check for refusal or other finish reasons
    if (candidate.finishReason !== 'STOP' && candidate.finishReason !== undefined) {
      console.warn("TTS Generation finished with reason:", candidate.finishReason);
      if (candidate.finishReason === 'SAFETY') {
          throw new Error("TTS Generation blocked by safety filters. Please try different text.");
      }
      if (candidate.finishReason === 'RECITATION') {
          throw new Error("TTS Generation blocked (Recitation). The model detected copyrighted content.");
      }
    }

    // Try to get audio data
    const base64Audio = candidate.content?.parts?.[0]?.inlineData?.data;
    
    if (!base64Audio) {
      // Check if there is a text part (error message or refusal from model)
      const textPart = candidate.content?.parts?.[0]?.text;
      if (textPart) {
        throw new Error(`API returned text instead of audio: ${textPart}`);
      }
      
      const reason = candidate.finishReason ? ` (Finish Reason: ${candidate.finishReason})` : '';
      throw new Error(`No audio data returned from API${reason}. The model might have refused the request.`);
    }

    return base64Audio;
  } catch (error: any) {
    console.error("TTS Error:", error);
    // Provide a more user-friendly message for common API errors
    if (error.message?.includes('400') || error.message?.includes('API key')) {
        throw new Error("API Key invalid or request malformed.");
    }
    throw error;
  }
};

// Translate Text
export const translateContent = async (text: string, targetLanguage: string) => {
  const ai = getAIClient();
  
  const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the translated text, do not add any explanations or quotes. Text: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Translation Error:", error);
    throw error;
  }
};

// Diarization (Using Gemini to transcribe and label speakers from an audio file)
// Note: Real-time diarization is complex; here we simulate "Upload & Analyze" using flash.
export const analyzeConversation = async (audioBase64: string, mimeType: string) => {
  const ai = getAIClient();
  
  const prompt = `
    Analyze this audio conversation. 
    Transcribe the conversation and identify different speakers.
    Format the output as a JSON array of objects, where each object has:
    - "speaker": "Speaker 1", "Speaker 2", etc.
    - "text": The text spoken.
    - "startTime": approximate start time in seconds (number).
    - "endTime": approximate end time in seconds (number).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: audioBase64
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Diarization Error:", error);
    throw error;
  }
};

// Helper to encode ArrayBuffer to Base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

// Convert Raw PCM 16-bit (24kHz) to WAV Blob
export const pcmToWavBlob = (base64PCM: string, sampleRate: number = 24000): Blob => {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // WAV Header (44 bytes)
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);

  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  // RIFF chunk descriptor
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(8, 'WAVE');

  // fmt sub-chunk
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true); // NumChannels (1 for Mono)
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * 2, true); // ByteRate (SampleRate * BlockAlign)
  view.setUint16(32, 2, true); // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true); // BitsPerSample

  // data sub-chunk
  writeString(36, 'data');
  view.setUint32(40, len, true);

  // Combine header and data
  return new Blob([wavHeader, bytes], { type: 'audio/wav' });
};
