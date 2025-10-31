import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const allowedOrigins = [
  "https://6b0351b3-5643-4969-a15a-38cd8cd9945c.lovableproject.com",
  "http://localhost:5173"
];

const getCorsHeaders = (origin: string | null) => {
  const corsOrigin = origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Credentials": "true",
  };
};

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

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

    // Validate input
    const validTypes = ["weekly", "spending", "goals"];
    if (!type || !validTypes.includes(type)) {
      throw new Error("Invalid insight type");
    }

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
      console.error("[ai-insights] AI API error:", {
        status: aiResponse.status,
        error: errorText,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const insights = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[ai-insights] Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const userMessage = error.message === "Invalid user token" || error.message === "Missing authorization header"
      ? "Authentication required"
      : error.message.includes("Invalid")
      ? error.message
      : "An error occurred processing your request";
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: error.message.includes("Authentication") ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
