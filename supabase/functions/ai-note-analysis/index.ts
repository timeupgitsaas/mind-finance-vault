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

    const authHeader = req.headers.get("Authorization")!;
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { noteId, analysisType } = await req.json();

    // Fetch all user notes
    const { data: notes, error: notesError } = await supabase
      .from("notes")
      .select("*")
      .eq("user_id", user.id);

    if (notesError) {
      throw notesError;
    }

    // Find the current note
    const currentNote = notes?.find((n: any) => n.id === noteId);
    if (!currentNote) {
      return new Response(JSON.stringify({ error: "Note not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

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
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error("Failed to analyze notes");
    }

    const aiData = await aiResponse.json();
    const analysis = aiData.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Error in ai-note-analysis function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});