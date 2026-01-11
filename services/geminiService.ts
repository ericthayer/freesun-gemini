
import { GoogleGenAI } from "@google/genai";

export const getFlightBriefing = async (prompt: string): Promise<string> => {
  try {
    // Always initialize GoogleGenAI with exactly { apiKey: process.env.API_KEY }
    // Creating a new instance right before making an API call ensures it always uses the most up-to-date API key.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert aeronautical safety officer and balloon pilot consultant. Provide brief, high-contrast, easy-to-read flight briefings. Use bullet points. Highlight major risks in ALL CAPS. Keep it professional and action-oriented for field operations.",
        temperature: 0.7,
        topP: 0.8,
        thinkingConfig: { thinkingBudget: 0 } // Fast response for remote crew
      },
    });

    return response.text || "No briefing available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
