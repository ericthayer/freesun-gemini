import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PermissionCheckRequest {
  permissionType: string;
  resource: string;
  action?: 'create' | 'read' | 'update' | 'delete';
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
        JSON.stringify({ error: "Missing authorization header", hasPermission: false }),
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
        JSON.stringify({ error: "Invalid token", hasPermission: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { permissionType, resource, action } = await req.json() as PermissionCheckRequest;

    const { data: crewMember } = await supabase
      .from("crew_members")
      .select("id, is_super_admin, role")
      .eq("user_id", user.id)
      .is("deleted_at", null)
      .maybeSingle();

    if (crewMember?.is_super_admin) {
      return new Response(
        JSON.stringify({
          hasPermission: true,
          isSuperAdmin: true,
          role: crewMember.role,
          crewMemberId: crewMember.id
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const roleMap: { [key: string]: string } = {
      'Pilot': 'pilot',
      'Ground Crew': 'ground_crew'
    };
    const roleName = roleMap[crewMember?.role || ''] || 'user';

    const { data: permissions } = await supabase
      .from("role_permissions")
      .select("*")
      .eq("role_name", roleName)
      .eq("permission_type", permissionType)
      .eq("resource", resource)
      .maybeSingle();

    let hasPermission = false;
    if (permissions && action) {
      const actionKey = `can_${action}` as keyof typeof permissions;
      hasPermission = permissions[actionKey] === true;
    } else if (permissions) {
      hasPermission = true;
    }

    return new Response(
      JSON.stringify({
        hasPermission,
        isSuperAdmin: false,
        role: roleName,
        permissions,
        crewMemberId: crewMember?.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Permission check error:", error);
    return new Response(
      JSON.stringify({ error: error.message, hasPermission: false }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
