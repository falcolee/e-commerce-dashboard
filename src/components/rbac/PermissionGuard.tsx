import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface PermissionGuardProps {
  required: string[];
  children: ReactNode;
  fallback?: ReactNode;
  requireAll?: boolean;
}

export const PermissionGuard = ({
  required,
  children,
  fallback = null,
  requireAll = false,
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();

  const hasAccess = requireAll
    ? required.every((perm) => hasPermission(perm))
    : required.some((perm) => hasPermission(perm));

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
