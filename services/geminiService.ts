
import { GoogleGenAI } from "@google/genai";

export const getFlightBriefing = async (prompt: string, constraints?: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const finalPrompt = constraints 
      ? `${prompt}\n\nCRITICAL OPERATIONAL CONSTRAINTS TO OBSERVE: ${constraints}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: finalPrompt,
      config: {
        systemInstruction: "You are an expert aeronautical safety officer and balloon pilot consultant. Provide brief, high-contrast, easy-to-read flight briefings. Use bullet points. Highlight major risks in ALL CAPS. If constraints are provided, prioritize them as absolute safety requirements. Keep it professional and action-oriented for field operations.",
        temperature: 0.7,
        topP: 0.8,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text || "No briefing available at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
