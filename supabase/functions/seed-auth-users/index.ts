import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.95.3";

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

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: crewMembers, error: fetchError } = await adminClient
      .from("crew_members")
      .select("id, name, email, role")
      .order("created_at", { ascending: true });

    if (fetchError) {
      return new Response(
        JSON.stringify({ error: fetchError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const defaultPassword = "freesun2024";
    const results: { name: string; email: string; status: string }[] = [];

    for (const member of crewMembers || []) {
      if (!member.email) {
        results.push({ name: member.name, email: "", status: "skipped_no_email" });
        continue;
      }

      const { data: existingUsers } = await adminClient.auth.admin.listUsers();
      const alreadyExists = existingUsers?.users?.some(
        (u: { email?: string }) => u.email === member.email
      );

      if (alreadyExists) {
        const existingUser = existingUsers?.users?.find(
          (u: { email?: string }) => u.email === member.email
        );
        if (existingUser) {
          await adminClient
            .from("crew_members")
            .update({ user_id: existingUser.id })
            .eq("id", member.id);
        }
        results.push({ name: member.name, email: member.email, status: "already_exists_linked" });
        continue;
      }

      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: member.email,
          password: defaultPassword,
          email_confirm: true,
          user_metadata: {
            name: member.name,
            role: member.role,
          },
        });

      if (authError) {
        results.push({ name: member.name, email: member.email, status: `error: ${authError.message}` });
        continue;
      }

      await adminClient
        .from("crew_members")
        .update({ user_id: authData.user.id })
        .eq("id", member.id);

      results.push({ name: member.name, email: member.email, status: "created" });
    }

    return new Response(
      JSON.stringify({ message: "Auth seed complete", results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
