
import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) ? process.env.API_KEY : '';
  return new GoogleGenAI({ apiKey });
};

// Map UI voice names to valid Gemini API voice names
const VOICE_MAPPING: Record<string, string> = {
  'Kore': 'Kore',
  'Fenrir': 'Fenrir',
  '不羁青年': 'Fenrir',
  '嚣张小姐': 'Kore',
  '机械战甲': 'Charon',
  '热心大婶': 'Aoede',
  '搞笑大爷': 'Puck',
  '温润男声': 'Zephyr',
  '温暖闺蜜': 'Kore',
  '我的数字分身': 'Charon',
  'Narrator': 'Puck'
};

const handleApiError = (error: any, context: string) => {
  console.error(`${context} Error:`, error);
  // Specifically catch Region Not Supported (403)
  if (error.status === 403 || error.message?.includes('Region not supported') || error.message?.includes('403')) {
    throw new Error("您的地区暂不支持 Gemini API (Region not supported)。请检查网络代理环境或参考官方可用地区列表。");
  }
  if (error.message?.includes('API key')) {
    throw new Error("API Key 无效或缺失。");
  }
  throw error;
};

// Text to Speech
export const generateSpeech = async (text: string, voiceName: string = 'Kore') => {
  const ai = getAIClient();
  const apiVoiceName = VOICE_MAPPING[voiceName] || 'Kore';
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ['AUDIO'] as any, 
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: apiVoiceName },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error("API 未返回有效内容。");
    
    const base64Audio = candidate.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      if (candidate.finishReason === 'SAFETY') throw new Error("内容因违反安全策略被拦截。");
      throw new Error("未获取到音频数据流。");
    }
    return base64Audio;
  } catch (error: any) {
    return handleApiError(error, "TTS Generation");
  }
};

// Translate Text
export const translateContent = async (text: string, targetLanguage: string) => {
  const ai = getAIClient();
  const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the translated text. Text: ${text}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text?.trim() || text;
  } catch (error) {
    return handleApiError(error, "Translation");
  }
};

// Diarization
export const analyzeConversation = async (audioBase64: string, mimeType: string) => {
  const ai = getAIClient();
  const prompt = `Analyze this audio. Format output as JSON array of objects: {"speaker": "Speaker 1", "text": "...", "startTime": 0, "endTime": 1}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [{ inlineData: { mimeType, data: audioBase64 } }, { text: prompt }]
      },
      config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "[]");
  } catch (error) {
    return handleApiError(error, "Diarization");
  }
};

export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) { binary += String.fromCharCode(bytes[i]); }
  return btoa(binary);
};

export const pcmToWavBlob = (base64PCM: string, sampleRate: number = 24000): Blob => {
  const binaryString = atob(base64PCM);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }
  const wavHeader = new ArrayBuffer(44);
  const view = new DataView(wavHeader);
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
  };
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + len, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, len, true);
  return new Blob([wavHeader, bytes], { type: 'audio/wav' });
};
