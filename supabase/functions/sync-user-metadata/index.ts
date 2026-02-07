import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
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

    const { data: crewMembers, error: fetchError } = await adminClient
      .from("crew_members")
      .select("id, name, email, role, user_id")
      .not("user_id", "is", null);

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { name: string; email: string; status: string }[] = [];

    for (const member of crewMembers || []) {
      if (!member.user_id) {
        results.push({
          name: member.name,
          email: member.email,
          status: "skipped_no_user_id"
        });
        continue;
      }

      const { data: userData, error: getUserError } =
        await adminClient.auth.admin.getUserById(member.user_id);

      if (getUserError) {
        results.push({
          name: member.name,
          email: member.email,
          status: `error: ${getUserError.message}`
        });
        continue;
      }

      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        member.user_id,
        {
          user_metadata: {
            name: member.name,
            role: member.role,
          },
        }
      );

      if (updateError) {
        results.push({
          name: member.name,
          email: member.email,
          status: `error: ${updateError.message}`
        });
        continue;
      }

      results.push({
        name: member.name,
        email: member.email,
        status: "metadata_synced"
      });
    }

    return new Response(
      JSON.stringify({ message: "User metadata sync complete", results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
