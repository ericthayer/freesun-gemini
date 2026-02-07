import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const passwordMap: { [email: string]: string } = {
  "sarah@freesun.net": "Sky2024!Launch",
  "thorne@freesun.net": "David2024!Pilot",
  "mike@freesun.net": "Mike2024!Ground",
  "elena@freesun.net": "Elena2024!Crew",
  "tom@freesun.net": "Tom2024!Wilson",
  "linda@freesun.net": "Linda2024!Gao",
  "james@freesun.net": "James2024!Pete",
  "sofia@freesun.net": "Sofia2024!Rossi",
  "marcus@freesun.net": "Marcus2024!Sky",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: crewMembers, error: fetchError } = await adminClient
      .from("crew_members")
      .select("id, name, email, user_id")
      .not("user_id", "is", null)
      .order("created_at", { ascending: true });

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { name: string; email: string; password: string; status: string }[] = [];

    for (const member of crewMembers || []) {
      if (!member.email || !member.user_id) {
        results.push({
          name: member.name,
          email: member.email || "",
          password: "",
          status: "skipped_no_user_id"
        });
        continue;
      }

      const tempPassword = passwordMap[member.email] || "FreeSun2024!Temp";

      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        member.user_id,
        { password: tempPassword }
      );

      if (updateError) {
        results.push({
          name: member.name,
          email: member.email,
          password: "",
          status: `error: ${updateError.message}`
        });
        continue;
      }

      results.push({
        name: member.name,
        email: member.email,
        password: tempPassword,
        status: "password_updated"
      });
    }

    return new Response(
      JSON.stringify({ message: "Password reset complete", results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
