
import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFlightBriefing = async (prompt: string, constraints?: string): Promise<string> => {
  try {
    const ai = getAI();

    const finalPrompt = constraints
      ? `${prompt}\n\nCRITICAL OPERATIONAL & NEGATIVE CONSTRAINTS (AVOID THESE): ${constraints}`
      : prompt;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: finalPrompt,
      config: {
        systemInstruction: "You are an expert aeronautical safety officer and balloon pilot consultant. Provide brief, high-contrast, easy-to-read flight briefings. Use bullet points. Highlight major risks in ALL CAPS. If constraints are provided, especially negative ones (e.g., 'avoid', 'do not', 'stay away'), prioritize them as absolute safety requirements and explicitly mention how to mitigate those risks. Keep it professional and action-oriented for field operations.",
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

interface BioContext {
  name: string;
  role: string;
  experienceYears: number;
  certifications: string[];
  specialty?: string;
}

export const generateCrewBio = async (context: BioContext): Promise<string> => {
  try {
    const ai = getAI();

    const prompt = `Write a professional bio for a hot air balloon club crew member.

Name: ${context.name}
Role: ${context.role}
Experience: ${context.experienceYears} years
Certifications: ${context.certifications.length > 0 ? context.certifications.join(', ') : 'None listed'}
Specialty: ${context.specialty || 'General operations'}

Requirements:
- Write in third person
- 2-3 sentences maximum
- Focus on their expertise and contributions
- Keep a warm, professional tone suitable for a club profile
- Do NOT use quotes around the bio
- Reference their specific role and experience naturally`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a professional copywriter for a hot air balloon club. Write concise, compelling crew member bios that highlight individual strengths and contributions. Keep bios under 300 characters. No markdown formatting. No quotation marks around the text.",
        temperature: 0.8,
        topP: 0.9,
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Gemini Bio Generation Error:", error);
    throw error;
  }
};
