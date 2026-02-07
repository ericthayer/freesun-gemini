import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const passwordMap: { [email: string]: string } = {
  "sarah@freesun.net": "Josh2024!Dalbey",
  "thorne@freesun.net": "Doug2024!Lorenz",
  "mike@freesun.net": "Chad2024!Lorenz",
  "elena@freesun.net": "Amanda2024!Dalbey",
  "tom@freesun.net": "Andy2024!Crabb",
  "linda@freesun.net": "Eric2024!Thayer",
  "james@freesun.net": "Jason2024!Flynn",
  "sofia@freesun.net": "Joyce2024!Dalbey",
  "marcus@freesun.net": "Jon2024!Manning",
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
