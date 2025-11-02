import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Verify admin authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'superadmin'])
      .single();

    if (roleError || !roleData) {
      throw new Error('Unauthorized: User is not an admin');
    }

    const { userId } = await req.json();

    if (!userId) {
      throw new Error('Missing required field: userId');
    }

    console.log('[admin-user-usage] Fetching usage for user:', userId);

    // Get all data counts and sizes
    const [notes, transactions, diaryEntries, aiConversations, folders] = await Promise.all([
      supabaseAdmin.from('notes').select('id, content, title', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('transactions').select('id', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('diary_entries').select('id, content', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('ai_conversations').select('id, messages', { count: 'exact' }).eq('user_id', userId),
      supabaseAdmin.from('folders').select('id', { count: 'exact' }).eq('user_id', userId),
    ]);

    // Calculate storage usage (approximate)
    const calculateSize = (data: any[]) => {
      return data.reduce((total, item) => {
        const str = JSON.stringify(item);
        return total + new Blob([str]).size;
      }, 0);
    };

    const notesSize = calculateSize(notes.data || []);
    const diarySize = calculateSize(diaryEntries.data || []);
    const aiConvSize = calculateSize(aiConversations.data || []);

    const totalStorageBytes = notesSize + diarySize + aiConvSize;
    const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

    // Calculate AI usage
    const totalAiMessages = (aiConversations.data || []).reduce((total, conv: any) => {
      return total + (Array.isArray(conv.messages) ? conv.messages.length : 0);
    }, 0);

    // Estimate cost (example values - adjust based on your actual costs)
    const costPerMB = 0.01; // $0.01 per MB
    const costPerAiMessage = 0.002; // $0.002 per AI message
    const baseCost = 0.50; // $0.50 base cost per user

    const storageCost = parseFloat(totalStorageMB) * costPerMB;
    const aiCost = totalAiMessages * costPerAiMessage;
    const totalCost = baseCost + storageCost + aiCost;

    const usage = {
      storage: {
        totalMB: parseFloat(totalStorageMB),
        breakdown: {
          notes: (notesSize / (1024 * 1024)).toFixed(2),
          diary: (diarySize / (1024 * 1024)).toFixed(2),
          aiConversations: (aiConvSize / (1024 * 1024)).toFixed(2),
        }
      },
      records: {
        notes: notes.count || 0,
        transactions: transactions.count || 0,
        diaryEntries: diaryEntries.count || 0,
        aiConversations: aiConversations.count || 0,
        folders: folders.count || 0,
        total: (notes.count || 0) + (transactions.count || 0) + (diaryEntries.count || 0) + 
               (aiConversations.count || 0) + (folders.count || 0)
      },
      ai: {
        totalMessages: totalAiMessages,
        conversations: aiConversations.count || 0
      },
      cost: {
        storage: parseFloat(storageCost.toFixed(4)),
        ai: parseFloat(aiCost.toFixed(4)),
        base: baseCost,
        total: parseFloat(totalCost.toFixed(4)),
        currency: 'USD'
      }
    };

    return new Response(
      JSON.stringify({ usage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('[admin-user-usage] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
