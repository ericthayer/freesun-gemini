import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";
import { GoogleGenAI } from "npm:@google/genai@1.35.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const geminiKey = Deno.env.get("API_KEY");

    if (!geminiKey) {
      return new Response(
        JSON.stringify({ error: "API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    const { data: members, error: fetchError } = await supabase
      .from("crew_members")
      .select("id, name, role, experience_years, certifications, specialty, bio");

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { id: string; name: string; oldBio: string; newBio: string }[] = [];

    for (const member of members || []) {
      const prompt = `Write a professional bio for a hot air balloon club crew member.

Name: ${member.name}
Role: ${member.role}
Experience: ${member.experience_years} years
Certifications: ${member.certifications?.length > 0 ? member.certifications.join(", ") : "None listed"}
Specialty: ${member.specialty || "General operations"}

Requirements:
- Write in third person
- 2-3 sentences maximum
- Focus on their expertise and contributions
- Keep a warm, professional tone suitable for a club profile
- Do NOT use quotes around the bio
- Reference their specific role and experience naturally
- Use the name "${member.name}" correctly`;

      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: prompt,
        config: {
          systemInstruction:
            "You are a professional copywriter for a hot air balloon club. Write concise, compelling crew member bios that highlight individual strengths and contributions. Keep bios under 300 characters. No markdown formatting. No quotation marks around the text.",
          temperature: 0.8,
          topP: 0.9,
        },
      });

      const newBio = response.text?.trim() || "";

      if (newBio) {
        await supabase
          .from("crew_members")
          .update({ bio: newBio })
          .eq("id", member.id);

        results.push({
          id: member.id,
          name: member.name,
          oldBio: member.bio || "",
          newBio,
        });
      }
    }

    return new Response(
      JSON.stringify({ updated: results.length, results }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
