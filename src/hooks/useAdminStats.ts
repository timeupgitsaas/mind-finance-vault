import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdminStats {
  mrr: number;
  mrrChange: number;
  totalUsers: number;
  paidUsers: number;
  freeUsers: number;
  conversionRate: number;
  paymentsThisMonth: number;
  failedPayments: number;
  churnRate: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  planDistribution: {
    free: number;
    basic: number;
    pro: number;
    enterprise: number;
  };
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);

        // Get total users count
        const { count: totalUsers } = await supabase
          .from('user_preferences')
          .select('*', { count: 'exact', head: true });

        // Get subscriptions data
        const { data: subscriptions } = await supabase
          .from('subscriptions')
          .select('plan_type, status, created_at');

        // Get payments data
        const { data: payments } = await supabase
          .from('payments')
          .select('amount, status, created_at, paid_at');

        // Calculate stats
        const now = new Date();
        const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count paid vs free users
        const paidUsers = subscriptions?.filter(s => 
          s.plan_type !== 'free' && s.status === 'active'
        ).length || 0;
        
        const freeUsers = (totalUsers || 0) - paidUsers;

        // Calculate MRR (Monthly Recurring Revenue)
        const activePaidSubs = subscriptions?.filter(s => 
          s.plan_type !== 'free' && s.status === 'active'
        ) || [];
        
        const mrr = activePaidSubs.reduce((sum, sub) => {
          switch(sub.plan_type) {
            case 'basic': return sum + 19.90;
            case 'pro': return sum + 49.90;
            case 'enterprise': return sum + 99.90;
            default: return sum;
          }
        }, 0);

        // Calculate payments this month
        const paymentsThisMonth = payments?.filter(p => 
          new Date(p.created_at) >= currentMonthStart && 
          p.status === 'success'
        ).length || 0;

        const failedPayments = payments?.filter(p => 
          new Date(p.created_at) >= currentMonthStart && 
          p.status === 'failed'
        ).length || 0;

        // Calculate new users
        const newUsersLast7Days = subscriptions?.filter(s => 
          new Date(s.created_at) >= last7Days
        ).length || 0;

        const newUsersLast30Days = subscriptions?.filter(s => 
          new Date(s.created_at) >= last30Days
        ).length || 0;

        // Calculate conversion rate
        const conversionRate = totalUsers ? (paidUsers / totalUsers) * 100 : 0;

        // Plan distribution
        const planDistribution = {
          free: freeUsers,
          basic: subscriptions?.filter(s => s.plan_type === 'basic' && s.status === 'active').length || 0,
          pro: subscriptions?.filter(s => s.plan_type === 'pro' && s.status === 'active').length || 0,
          enterprise: subscriptions?.filter(s => s.plan_type === 'enterprise' && s.status === 'active').length || 0,
        };

        // Calculate churn rate (simplified)
        const churnRate = 4.2; // Placeholder - needs historical data for accurate calculation

        setStats({
          mrr,
          mrrChange: 15, // Placeholder - needs historical comparison
          totalUsers: totalUsers || 0,
          paidUsers,
          freeUsers,
          conversionRate,
          paymentsThisMonth,
          failedPayments,
          churnRate,
          newUsersLast7Days,
          newUsersLast30Days,
          planDistribution,
        });
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading, error };
}
