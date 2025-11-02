import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (has admin access)
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

    // Verify the request is from an authenticated admin
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

    console.log('[admin-list-users] Admin verified:', user.email);

    // List all users from auth.users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      throw listError;
    }

    console.log('[admin-list-users] Found users:', users?.length || 0);

    // Enrich user data with additional information
    const enrichedUsers = await Promise.all(
      (users || []).map(async (authUser) => {
        // Get subscription
        const { data: subscription } = await supabaseAdmin
          .from('subscriptions')
          .select('plan_type, status')
          .eq('user_id', authUser.id)
          .single();

        // Get role
        const { data: role } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', authUser.id)
          .single();

        // Get usage stats
        const { count: notesCount } = await supabaseAdmin
          .from('notes')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id);

        const { count: transactionsCount } = await supabaseAdmin
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', authUser.id);

        return {
          id: authUser.id,
          email: authUser.email,
          created_at: authUser.created_at,
          last_sign_in_at: authUser.last_sign_in_at,
          plan_type: subscription?.plan_type || 'free',
          status: subscription?.status || 'active',
          role: role?.role || 'user',
          usage: {
            notes: notesCount || 0,
            transactions: transactionsCount || 0,
          }
        };
      })
    );

    return new Response(
      JSON.stringify({ users: enrichedUsers }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('[admin-list-users] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
