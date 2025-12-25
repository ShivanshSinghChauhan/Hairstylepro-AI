
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { Gender } from "../types";

export class GeminiService {
  private async withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error.message?.includes("429") || error.status === 429 || error.code === 429;
      if (isRateLimit && retries > 0) {
        console.warn(`Rate limit hit (429). Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async generateHairstyle(imageBase64: string, styleName: string, gender: Gender, variationSeed: number): Promise<string | null> {
    return this.withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const genderInstruction = gender === 'male' 
        ? "Ensure the hairstyle is masculine and appropriate for a man." 
        : "Ensure the hairstyle is feminine and appropriate for a woman.";

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } },
            { text: `Apply a photorealistic ${styleName} hairstyle to this person. ${genderInstruction} This is variation #${variationSeed}, so make it unique (e.g., adjust the texture, stray hairs, or specific styling details). Ensure the texture looks natural and the hairline blends perfectly with their forehead. Account for their face shape and skin tone.` }
          ]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    });
  }

  async editImage(imageBase64: string, prompt: string): Promise<string | null> {
    return this.withRetry(async () => {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: imageBase64.split(',')[1], mimeType: 'image/png' } },
            { text: prompt }
          ]
        },
        config: {
          systemInstruction: SYSTEM_INSTRUCTION
        }
      });

      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
      return null;
    });
  }
}

export const geminiService = new GeminiService();
