import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpdateEmailRequest {
  crewMemberId?: string;
  batchUpdate?: boolean;
  dryRun?: boolean;
}

interface UpdateResult {
  crewMemberId: string;
  crewMemberName: string;
  oldEmail: string;
  newEmail: string;
  success: boolean;
  error?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminCrewMember } = await supabaseAdmin
      .from("crew_members")
      .select("id, is_super_admin, name")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!adminCrewMember?.is_super_admin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only Super Admins can update auth emails" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { crewMemberId, batchUpdate = false, dryRun = false } = await req.json() as UpdateEmailRequest;

    const results: UpdateResult[] = [];
    let crewMembers: any[] = [];

    if (batchUpdate) {
      const { data, error } = await supabaseAdmin
        .from("crew_members")
        .select("id, name, email, user_id")
        .not("user_id", "is", null)
        .is("deleted_at", null)
        .neq("email", "");

      if (error) throw error;
      crewMembers = data || [];
    } else if (crewMemberId) {
      const { data, error } = await supabaseAdmin
        .from("crew_members")
        .select("id, name, email, user_id")
        .eq("id", crewMemberId)
        .is("deleted_at", null)
        .maybeSingle();

      if (error) throw error;
      if (data) crewMembers = [data];
    } else {
      return new Response(
        JSON.stringify({ error: "Must specify crewMemberId or batchUpdate" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    for (const member of crewMembers) {
      if (!member.user_id || !member.email) {
        results.push({
          crewMemberId: member.id,
          crewMemberName: member.name,
          oldEmail: "N/A",
          newEmail: member.email || "N/A",
          success: false,
          error: "Missing user_id or email"
        });
        continue;
      }

      try {
        const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(member.user_id);

        if (!authUser.user) {
          results.push({
            crewMemberId: member.id,
            crewMemberName: member.name,
            oldEmail: "N/A",
            newEmail: member.email,
            success: false,
            error: "Auth user not found"
          });
          continue;
        }

        const oldEmail = authUser.user.email || "";

        if (oldEmail === member.email) {
          results.push({
            crewMemberId: member.id,
            crewMemberName: member.name,
            oldEmail,
            newEmail: member.email,
            success: true,
            error: "Already in sync"
          });
          continue;
        }

        if (dryRun) {
          results.push({
            crewMemberId: member.id,
            crewMemberName: member.name,
            oldEmail,
            newEmail: member.email,
            success: true,
            error: "Dry run - no changes made"
          });
          continue;
        }

        const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          member.user_id,
          {
            email: member.email,
            email_confirm: true
          }
        );

        if (updateError) {
          results.push({
            crewMemberId: member.id,
            crewMemberName: member.name,
            oldEmail,
            newEmail: member.email,
            success: false,
            error: updateError.message
          });
          continue;
        }

        await supabaseAdmin.from("admin_actions").insert({
          admin_user_id: user.id,
          admin_crew_member_id: adminCrewMember.id,
          action_type: "sync_auth_email",
          target_crew_member_id: member.id,
          target_user_id: member.user_id,
          target_resource: "auth.users",
          before_data: { email: oldEmail },
          after_data: { email: member.email }
        });

        results.push({
          crewMemberId: member.id,
          crewMemberName: member.name,
          oldEmail,
          newEmail: member.email,
          success: true
        });

      } catch (error) {
        results.push({
          crewMemberId: member.id,
          crewMemberName: member.name,
          oldEmail: "Unknown",
          newEmail: member.email,
          success: false,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success && !r.error?.includes("Already in sync")).length;
    const alreadySyncedCount = results.filter(r => r.error?.includes("Already in sync")).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        success: true,
        dryRun,
        summary: {
          total: results.length,
          updated: successCount,
          alreadySynced: alreadySyncedCount,
          failed: failureCount
        },
        results
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Email sync error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
