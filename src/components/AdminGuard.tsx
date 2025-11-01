import { useIsAdmin } from "@/hooks/useIsAdmin";

interface AdminGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminGuard({ children, fallback = null }: AdminGuardProps) {
  const { isAdmin, loading } = useIsAdmin();

  if (loading) {
    return null;
  }

  return isAdmin ? <>{children}</> : <>{fallback}</>;
}
