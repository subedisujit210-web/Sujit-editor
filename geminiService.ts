
import { GoogleGenAI } from "@google/genai";

const IMAGE_MODEL = 'gemini-2.5-flash-image';
const TEXT_MODEL = 'gemini-3-flash-preview';

export async function processWithAI(
  prompt: string,
  base64Image?: string,
  mimeType?: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const contents: any = { parts: [{ text: prompt }] };

  if (base64Image && mimeType) {
    const base64Data = base64Image.split(',')[1];
    contents.parts.unshift({
      inlineData: {
        data: base64Data,
        mimeType: mimeType,
      },
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: contents,
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No response parts received from the model.");
    }

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("The AI did not return an image.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to process image.");
  }
}

/**
 * Generate text content based on image context or user prompt.
 */
export async function generateWriting(
  prompt: string,
  base64Image?: string,
  mimeType?: string
): Promise<string> {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  let contents: any;
  if (base64Image && mimeType) {
    const base64Data = base64Image.split(',')[1];
    contents = {
      parts: [
        { inlineData: { data: base64Data, mimeType: mimeType } },
        { text: `Based on this image and this context: "${prompt}", write a creative and engaging caption or short story.` }
      ]
    };
  } else {
    contents = { parts: [{ text: prompt }] };
  }

  try {
    const response = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: contents,
    });
    return response.text || "No text generated.";
  } catch (error: any) {
    console.error("Gemini Text API Error:", error);
    throw new Error("Failed to generate writing content.");
  }
}
