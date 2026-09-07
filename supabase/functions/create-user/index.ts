// supabase/functions/create-user/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { email, password, metadata } = await req.json();

    if (!email || !password) {
      return new Response(
        JSON.stringify({ error: "Email and password are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ------------------------------------------------------------
    // 1. CREATE AUTH USER (FORCED EMAIL BEHAVIOR)
    // ------------------------------------------------------------
    const signupType = metadata?.signup_type;

    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,

        // ⭐ FORCED EMAIL BEHAVIOR:
        // Members → auto-confirmed (no email)
        // Non-members → NOT confirmed (email ALWAYS sent)
        email_confirm: signupType === "member_signup" ? true : false,

        user_metadata: metadata || {},
      });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const user = authData.user;

    // ------------------------------------------------------------
    // 2. MEMBER SIGNUP — ATTACH TO EXISTING MEMBERSHIP
    // ------------------------------------------------------------
    if (metadata?.membership_id) {
      const { error: attachError } = await supabase
        .from("household_memberships")
        .update({ user_id: user.id })
        .eq("id", metadata.membership_id);

      if (attachError) {
        return new Response(JSON.stringify({ error: attachError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "member_signup",
          user,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ------------------------------------------------------------
    // 3. NON-MEMBER SIGNUP — CREATE NON-MEMBER ROW
    // ------------------------------------------------------------
    if (signupType === "non_member_signup") {
      const { error: nmError } = await supabase
        .from("household_memberships")
        .insert({
          user_id: user.id,
          email,
          primary_first_name: metadata.first_name,
          primary_last_name: metadata.last_name,
          membership_type: "non_member",
          status: "pending",
          club_id: metadata.club_id,
        });

      if (nmError) {
        return new Response(JSON.stringify({ error: nmError.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          type: "non_member_signup",
          user,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // ------------------------------------------------------------
    // 4. SAFETY NET — NO MEMBERSHIP ACTION
    // ------------------------------------------------------------
    return new Response(
      JSON.stringify({
        success: true,
        type: "no_membership_action",
        user,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
