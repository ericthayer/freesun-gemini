import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PasswordResetRequest {
  crewMemberId?: string;
  newPassword?: string;
  sendResetEmail?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
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
        JSON.stringify({ error: "Unauthorized: Only Super Admins can reset passwords" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { crewMemberId, newPassword, sendResetEmail = false } = await req.json() as PasswordResetRequest;

    if (!crewMemberId) {
      return new Response(
        JSON.stringify({ error: "crewMemberId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: targetMember, error: fetchError } = await supabaseAdmin
      .from("crew_members")
      .select("id, name, email, user_id")
      .eq("id", crewMemberId)
      .is("deleted_at", null)
      .maybeSingle();

    if (fetchError || !targetMember) {
      return new Response(
        JSON.stringify({ error: "Crew member not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!targetMember.user_id) {
      return new Response(
        JSON.stringify({ error: "User does not have an auth account" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (sendResetEmail) {
      const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: targetMember.email,
      });

      if (resetError) {
        return new Response(
          JSON.stringify({ error: `Failed to send reset email: ${resetError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin.from("admin_actions").insert({
        admin_user_id: user.id,
        admin_crew_member_id: adminCrewMember.id,
        action_type: "send_password_reset",
        target_crew_member_id: targetMember.id,
        target_user_id: targetMember.user_id,
        target_resource: "auth.users",
        after_data: { email: targetMember.email, method: "email_link" }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Password reset email sent to ${targetMember.email}`,
          method: "email"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (newPassword) {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        targetMember.user_id,
        { password: newPassword }
      );

      if (updateError) {
        return new Response(
          JSON.stringify({ error: `Failed to update password: ${updateError.message}` }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      await supabaseAdmin.from("admin_actions").insert({
        admin_user_id: user.id,
        admin_crew_member_id: adminCrewMember.id,
        action_type: "reset_password",
        target_crew_member_id: targetMember.id,
        target_user_id: targetMember.user_id,
        target_resource: "auth.users",
        after_data: { method: "admin_reset" }
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Password updated for ${targetMember.name}`,
          method: "direct"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ error: "Must specify either newPassword or sendResetEmail" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
