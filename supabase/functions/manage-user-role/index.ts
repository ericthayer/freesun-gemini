import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface RoleManagementRequest {
  action: 'assign' | 'revoke';
  targetCrewMemberId: string;
  roleName?: string;
  isSuperAdmin?: boolean;
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
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: adminCrewMember } = await supabase
      .from("crew_members")
      .select("id, is_super_admin, name")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (!adminCrewMember?.is_super_admin) {
      return new Response(
        JSON.stringify({ error: "Unauthorized: Only Super Admins can manage roles" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { action, targetCrewMemberId, roleName, isSuperAdmin } = await req.json() as RoleManagementRequest;

    const { data: targetCrewMember, error: targetError } = await supabase
      .from("crew_members")
      .select("id, name, email, user_id, is_super_admin, role")
      .eq("id", targetCrewMemberId)
      .is("deleted_at", null)
      .maybeSingle();

    if (targetError || !targetCrewMember) {
      return new Response(
        JSON.stringify({ error: "Target crew member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === 'assign') {
      if (isSuperAdmin !== undefined) {
        if (targetCrewMember.id === adminCrewMember.id && isSuperAdmin === false) {
          return new Response(
            JSON.stringify({ error: "You cannot remove your own Super Admin status" }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const beforeData = {
          name: targetCrewMember.name,
          email: targetCrewMember.email,
          is_super_admin: targetCrewMember.is_super_admin
        };

        const { error: updateError } = await supabase
          .from("crew_members")
          .update({ is_super_admin: isSuperAdmin })
          .eq("id", targetCrewMemberId);

        if (updateError) {
          return new Response(
            JSON.stringify({ error: "Failed to update Super Admin status", details: updateError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        const afterData = {
          ...beforeData,
          is_super_admin: isSuperAdmin
        };

        await supabase.from("admin_actions").insert({
          admin_user_id: user.id,
          admin_crew_member_id: adminCrewMember.id,
          action_type: isSuperAdmin ? 'assign_super_admin' : 'revoke_super_admin',
          target_crew_member_id: targetCrewMemberId,
          target_user_id: targetCrewMember.user_id,
          target_resource: 'crew_members',
          target_resource_id: targetCrewMemberId,
          before_data: beforeData,
          after_data: afterData
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Super Admin status ${isSuperAdmin ? 'granted to' : 'revoked from'} ${targetCrewMember.name}`,
            targetCrewMember: {
              id: targetCrewMember.id,
              name: targetCrewMember.name,
              email: targetCrewMember.email,
              is_super_admin: isSuperAdmin
            }
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (roleName && targetCrewMember.user_id) {
        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: targetCrewMember.user_id,
            crew_member_id: targetCrewMemberId,
            role_name: roleName,
            assigned_by: user.id
          });

        if (roleError) {
          return new Response(
            JSON.stringify({ error: "Failed to assign role", details: roleError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase.from("admin_actions").insert({
          admin_user_id: user.id,
          admin_crew_member_id: adminCrewMember.id,
          action_type: 'assign_role',
          target_crew_member_id: targetCrewMemberId,
          target_user_id: targetCrewMember.user_id,
          target_resource: 'user_roles',
          after_data: { role_name: roleName }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Role ${roleName} assigned to ${targetCrewMember.name}`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } else if (action === 'revoke') {
      if (roleName && targetCrewMember.user_id) {
        const { error: revokeError } = await supabase
          .from("user_roles")
          .update({ revoked_at: new Date().toISOString() })
          .eq("user_id", targetCrewMember.user_id)
          .eq("role_name", roleName)
          .is("revoked_at", null);

        if (revokeError) {
          return new Response(
            JSON.stringify({ error: "Failed to revoke role", details: revokeError.message }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }

        await supabase.from("admin_actions").insert({
          admin_user_id: user.id,
          admin_crew_member_id: adminCrewMember.id,
          action_type: 'revoke_role',
          target_crew_member_id: targetCrewMemberId,
          target_user_id: targetCrewMember.user_id,
          target_resource: 'user_roles',
          before_data: { role_name: roleName }
        });

        return new Response(
          JSON.stringify({
            success: true,
            message: `Role ${roleName} revoked from ${targetCrewMember.name}`
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Invalid action or missing parameters" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Role management error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
