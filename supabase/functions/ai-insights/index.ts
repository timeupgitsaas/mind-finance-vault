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

    const { type } = await req.json();

    // Get user data
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false })
      .limit(50);

    const { data: notes } = await supabaseClient
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    const { data: goals } = await supabaseClient
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id);

    // Prepare context for AI
    const context = {
      transactions: transactions || [],
      notes: notes || [],
      goals: goals || [],
    };

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "weekly-summary") {
      systemPrompt = "Você é um assistente financeiro pessoal. Analise os dados do usuário e forneça um resumo semanal conciso e acionável.";
      userPrompt = `Dados do usuário: ${JSON.stringify(context)}. Forneça um resumo semanal com insights sobre gastos, economias e progresso em relação às metas.`;
    } else if (type === "spending-analysis") {
      systemPrompt = "Você é um analista financeiro. Identifique padrões de gastos e forneça recomendações.";
      userPrompt = `Transações: ${JSON.stringify(context.transactions)}. Analise os gastos e identifique categorias com maior consumo e oportunidades de economia.`;
    } else if (type === "goal-suggestions") {
      systemPrompt = "Você é um consultor financeiro. Sugira metas realistas baseadas no histórico do usuário.";
      userPrompt = `Dados: ${JSON.stringify(context)}. Sugira 3 metas financeiras realistas baseadas no histórico de transações.`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to get AI insights");
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in ai-insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
