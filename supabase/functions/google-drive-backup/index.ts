import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    // Get user's Google token
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from("google_tokens")
      .select("access_token")
      .eq("user_id", user.id)
      .single();

    if (tokenError || !tokenData) {
      throw new Error("Google account not connected");
    }

    // Get all user data
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", user.id);

    const { data: notes } = await supabaseClient
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    const { data: goals } = await supabaseClient
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id);

    const backupData = {
      backup_date: new Date().toISOString(),
      transactions,
      notes,
      goals,
    };

    // Upload to Google Drive
    const metadata = {
      name: `Backup_${new Date().toISOString().split('T')[0]}.json`,
      mimeType: "application/json",
    };

    const formData = new FormData();
    formData.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    formData.append("file", new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" }));

    const uploadResponse = await fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
        body: formData,
      }
    );

    const uploadResult = await uploadResponse.json();

    return new Response(
      JSON.stringify({ success: true, fileId: uploadResult.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in google-drive-backup function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
