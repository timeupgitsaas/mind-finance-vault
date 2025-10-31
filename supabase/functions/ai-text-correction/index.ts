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
    // Initialize Supabase client for authentication
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Validate authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      throw new Error("Invalid user token");
    }

    const { text } = await req.json();

    // Validate input
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input");
    }

    if (text.length > 50000) {
      throw new Error("Text too long (max 50000 characters)");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const systemPrompt = `Você é um corretor de texto em português brasileiro. 
    Corrija apenas erros gramaticais, ortográficos e de pontuação.
    Mantenha o estilo e o conteúdo original do texto.
    Retorne APENAS o texto corrigido, sem explicações ou comentários.`;

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
          { role: "user", content: text }
        ],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[ai-text-correction] AI API error:", {
        status: aiResponse.status,
        error: errorText,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const correctedText = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ correctedText }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[ai-text-correction] Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const userMessage = error.message === "Invalid user token" || error.message === "Missing authorization header"
      ? "Authentication required"
      : error.message === "Text too long (max 50000 characters)" || error.message === "Invalid input"
      ? error.message
      : "An error occurred processing your request";
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: error.message.includes("Authentication") ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
