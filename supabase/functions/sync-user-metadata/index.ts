import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface SyncRequest {
  crewMemberId: string;
  syncEmail?: boolean;
  syncMetadata?: boolean;
}

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

    const { crewMemberId, syncEmail = true, syncMetadata = true } = await req.json() as SyncRequest;

    if (!crewMemberId) {
      return new Response(
        JSON.stringify({ error: "crewMemberId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: member, error: fetchError } = await adminClient
      .from("crew_members")
      .select("id, name, email, role, user_id")
      .eq("id", crewMemberId)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError || !member) {
      return new Response(
        JSON.stringify({ error: "Crew member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!member.user_id) {
      return new Response(
        JSON.stringify({ error: "Crew member does not have an auth account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: userData, error: getUserError } = await adminClient.auth.admin.getUserById(member.user_id);

    if (getUserError || !userData.user) {
      return new Response(
        JSON.stringify({ error: `Auth user not found: ${getUserError?.message}` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const updates: any = {};
    const syncResults: string[] = [];
    const oldEmail = userData.user.email;

    if (syncEmail && member.email && oldEmail !== member.email) {
      updates.email = member.email;
      updates.email_confirm = true;
      syncResults.push(`email: ${oldEmail} → ${member.email}`);
    }

    if (syncMetadata) {
      updates.user_metadata = {
        name: member.name,
        role: member.role,
      };
      syncResults.push("metadata synced");
    }

    if (Object.keys(updates).length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Already in sync",
          synced: []
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      member.user_id,
      updates
    );

    if (updateError) {
      return new Response(
        JSON.stringify({ error: `Failed to sync: ${updateError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (syncEmail && updates.email) {
      await adminClient.from("crew_members").update({
        last_auth_sync: new Date().toISOString()
      }).eq("id", crewMemberId);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Sync complete",
        synced: syncResults,
        crewMember: {
          id: member.id,
          name: member.name,
          email: member.email
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Sync error:", err);
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
