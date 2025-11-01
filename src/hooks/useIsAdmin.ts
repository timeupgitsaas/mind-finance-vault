import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        setLoading(true);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        const { data, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'superadmin'])
          .single();

        if (roleError) {
          if (roleError.code === 'PGRST116') {
            // No role found, user is not admin
            setIsAdmin(false);
          } else {
            throw roleError;
          }
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        setError(err as Error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, []);

  return { isAdmin, loading, error };
}
