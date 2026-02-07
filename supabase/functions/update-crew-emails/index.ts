import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
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

    // Email mappings based on crew member names
    const emailMappings = [
      { name: "Amanda Dalbey", email: "adalbey@freesun.net" },
      { name: "Andy Crabb", email: "acrabb@freesun.net" },
      { name: "Chad Lorenz", email: "clorenz@freesun.net" },
      { name: "Doug Lorenz", email: "dlorenz@freesun.net" },
      { name: "Eric Thayer", email: "ethayer@freesun.net" },
      { name: "Jason Flynn", email: "jflynn@freesun.net" },
      { name: "Jennifer Gill", email: "jgill@freesun.net" },
      { name: "Jon \"One Shoe\" Manning", email: "jmanning@freesun.net" },
      { name: "Josh Dalbey", email: "jdalbey@freesun.net" },
      { name: "Joyce Dalbey", email: "joycedalbey@freesun.net" },
    ];

    const results: { name: string; email: string; status: string }[] = [];

    for (const mapping of emailMappings) {
      // Get crew member
      const { data: crewMember, error: fetchError } = await adminClient
        .from("crew_members")
        .select("id, user_id")
        .eq("name", mapping.name)
        .maybeSingle();

      if (fetchError || !crewMember) {
        results.push({
          name: mapping.name,
          email: mapping.email,
          status: `error: crew member not found`,
        });
        continue;
      }

      // Update crew_members table
      const { error: updateCrewError } = await adminClient
        .from("crew_members")
        .update({ email: mapping.email })
        .eq("id", crewMember.id);

      if (updateCrewError) {
        results.push({
          name: mapping.name,
          email: mapping.email,
          status: `error updating crew_members: ${updateCrewError.message}`,
        });
        continue;
      }

      // Update auth.users email if user_id exists
      if (crewMember.user_id) {
        const { error: updateAuthError } =
          await adminClient.auth.admin.updateUserById(crewMember.user_id, {
            email: mapping.email,
          });

        if (updateAuthError) {
          results.push({
            name: mapping.name,
            email: mapping.email,
            status: `crew updated, auth error: ${updateAuthError.message}`,
          });
          continue;
        }

        results.push({
          name: mapping.name,
          email: mapping.email,
          status: "success: both updated",
        });
      } else {
        results.push({
          name: mapping.name,
          email: mapping.email,
          status: "success: crew updated (no auth account)",
        });
      }
    }

    return new Response(
      JSON.stringify({
        message: "Email update complete",
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
