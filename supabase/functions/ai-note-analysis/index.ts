import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
      }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("No authorization header provided");
      return new Response(JSON.stringify({ error: "Authorization header missing" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: "Authentication failed: " + authError.message }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!user) {
      console.error("No user found");
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { noteId, analysisType } = await req.json();
    
    console.log("[ai-note-analysis] Request received:", {
      noteId,
      analysisType,
      userId: user.id,
      timestamp: new Date().toISOString()
    });

    // Validate input
    if (!noteId || typeof noteId !== "string" || !noteId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      console.error("[ai-note-analysis] Invalid note ID format:", noteId);
      throw new Error("Invalid note ID format");
    }

    const validAnalysisTypes = ["similar", "insights"];
    if (!analysisType || !validAnalysisTypes.includes(analysisType)) {
      console.error("[ai-note-analysis] Invalid analysis type:", analysisType);
      throw new Error("Invalid analysis type");
    }

    // Fetch all user notes
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    if (notesError) {
      console.error("[ai-note-analysis] Error fetching notes:", notesError);
      throw notesError;
    }

    console.log("[ai-note-analysis] Fetched notes:", {
      count: notes?.length || 0,
      noteIds: notes?.map((n: any) => n.id) || [],
      searchingFor: noteId
    });

    // Find the current note
    const currentNote = notes?.find((n: any) => n.id === noteId);
    if (!currentNote) {
      console.error("[ai-note-analysis] Note not found:", {
        noteId,
        userId: user.id,
        availableNoteIds: notes?.map((n: any) => n.id) || []
      });
      return new Response(JSON.stringify({ 
        error: "Note not found",
        details: "The requested note does not exist or does not belong to your account"
      }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    
    console.log("[ai-note-analysis] Found note:", {
      noteId: currentNote.id,
      title: currentNote.title
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    if (analysisType === "similar") {
      // Find similar notes
      systemPrompt = `Você é um assistente especializado em análise de notas e conexões de ideias.
      Analise a nota fornecida e identifique quais outras notas têm conteúdo similar, ideias relacionadas ou conceitos complementares.
      Retorne uma lista de conexões sugeridas com justificativas claras.`;

      userPrompt = `Nota atual:
Título: ${currentNote.title}
Conteúdo: ${currentNote.content}
Tags: ${currentNote.tags?.join(", ") || "nenhuma"}

Outras notas do usuário:
${notes?.filter((n: any) => n.id !== noteId).map((n: any) => 
  `- ID: ${n.id}\n  Título: ${n.title}\n  Conteúdo: ${n.content.substring(0, 200)}...\n  Tags: ${n.tags?.join(", ") || "nenhuma"}`
).join("\n\n")}

Identifique as 3-5 notas mais relacionadas e explique as conexões.`;

    } else if (analysisType === "insights") {
      // Generate insights
      systemPrompt = `Você é um assistente de produtividade que analisa notas para gerar insights valiosos.
      Identifique padrões, temas recorrentes, ideias que se complementam e oportunidades de organização.`;

      userPrompt = `Analise estas notas do usuário e gere insights úteis:

${notes?.map((n: any) => 
  `Título: ${n.title}\nConteúdo: ${n.content.substring(0, 300)}...\nTags: ${n.tags?.join(", ") || "nenhuma"}\n`
).join("\n---\n")}

Forneça insights sobre:
1. Temas principais
2. Conexões interessantes
3. Sugestões de organização
4. Ideias que merecem mais desenvolvimento`;
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
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[ai-note-analysis] AI API error:", {
        status: aiResponse.status,
        error: errorText,
        userId: user.id,
        timestamp: new Date().toISOString()
      });
      
      if (aiResponse.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (aiResponse.status === 402) {
        throw new Error("Insufficient AI credits. Please add credits to continue.");
      }
      
      throw new Error("AI service unavailable");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("[ai-note-analysis] Error:", {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    
    const userMessage = error.message === "Invalid user token" || error.message === "Missing authorization header"
      ? "Authentication required"
      : error.message.includes("Invalid") || error.message.includes("Rate limit") || error.message.includes("credits")
      ? error.message
      : "An error occurred processing your request";
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { status: error.message.includes("Authentication") ? 401 : 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});