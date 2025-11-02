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

    const { targetUserId, newPlan } = await req.json();

    if (!targetUserId || !newPlan) {
      throw new Error('Missing required fields: targetUserId and newPlan');
    }

    // Validate plan type
    const validPlans = ['free', 'basic', 'pro', 'enterprise'];
    if (!validPlans.includes(newPlan)) {
      throw new Error('Invalid plan type');
    }

    console.log('[admin-change-plan] Admin:', user.email, 'changing user', targetUserId, 'to plan:', newPlan);

    // Update subscription
    const { data: subscription, error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({ 
        plan_type: newPlan,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', targetUserId)
      .select()
      .single();

    if (updateError) {
      // If subscription doesn't exist, create it
      if (updateError.code === 'PGRST116') {
        const { data: newSub, error: insertError } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: targetUserId,
            plan_type: newPlan,
            status: 'active'
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        console.log('[admin-change-plan] Created new subscription:', newSub);
      } else {
        throw updateError;
      }
    } else {
      console.log('[admin-change-plan] Updated subscription:', subscription);
    }

    // Log the action in audit log
    await supabaseAdmin
      .from('admin_audit_log')
      .insert({
        admin_user_id: user.id,
        action: 'change_plan',
        target_user_id: targetUserId,
        details: {
          new_plan: newPlan,
          timestamp: new Date().toISOString()
        }
      });

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Plan updated successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error: any) {
    console.error('[admin-change-plan] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});
