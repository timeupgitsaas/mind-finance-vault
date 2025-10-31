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

    const { message, conversationHistory } = await req.json();

    // Validate input
    if (!message || typeof message !== "string" || message.length > 10000) {
      throw new Error("Invalid message input");
    }

    if (conversationHistory && (!Array.isArray(conversationHistory) || conversationHistory.length > 50)) {
      throw new Error("Invalid conversation history");
    }

    // Get user data for context
    const { data: transactions } = await supabaseClient
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("date", { ascending: false });

    const { data: notes } = await supabaseClient
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    const { data: goals } = await supabaseClient
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id);

    const context = {
      transactions: transactions || [],
      notes: notes || [],
      goals: goals || [],
    };

    const systemPrompt = `Você é um assistente pessoal inteligente com acesso aos dados do usuário (finanças, notas e metas). 
    Responda perguntas sobre os dados de forma concisa e útil.
    
    Dados disponíveis:
    - ${context.transactions.length} transações financeiras
    - ${context.notes.length} notas
    - ${context.goals.length} metas financeiras
    
    Contexto completo: ${JSON.stringify(context)}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(conversationHistory || []),
      { role: "user", content: message }
    ];

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
        messages,
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[ai-chat] AI API error:", {
        status: aiResponse.status,
        error: errorText,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const response = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ response }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[ai-chat] Error:", {
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
