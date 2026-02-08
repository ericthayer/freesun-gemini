import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from './supabaseClient';

interface Permission {
  role_name: string;
  permission_type: string;
  resource: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
}

interface PermissionState {
  checkPermission: (permissionType: string, resource: string, action?: 'create' | 'read' | 'update' | 'delete') => Promise<boolean>;
  hasPermission: (permissionType: string, resource: string) => boolean;
  permissions: Permission[];
  loading: boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionState | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isSuperAdmin, crewProfile, user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);

  const refreshPermissions = useCallback(async () => {
    if (!user || !crewProfile) {
      setPermissions([]);
      return;
    }

    if (isSuperAdmin) {
      const { data } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_name', 'super_admin');

      setPermissions(data || []);
      return;
    }

    const roleMap: { [key: string]: string } = {
      'Pilot': 'pilot',
      'Ground Crew': 'ground_crew'
    };
    const roleName = roleMap[crewProfile.role] || 'user';

    const { data } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_name', roleName);

    setPermissions(data || []);
  }, [user, crewProfile, isSuperAdmin]);

  const checkPermission = useCallback(async (
    permissionType: string,
    resource: string,
    action?: 'create' | 'read' | 'update' | 'delete'
  ): Promise<boolean> => {
    if (isSuperAdmin) {
      return true;
    }

    if (!user) {
      return false;
    }

    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return false;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/check-user-permission`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ permissionType, resource, action })
        }
      );

      const result = await response.json();
      return result.hasPermission || false;
    } catch (error) {
      console.error('Permission check error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  }, [user, isSuperAdmin]);

  const hasPermission = useCallback((permissionType: string, resource: string): boolean => {
    if (isSuperAdmin) {
      return true;
    }

    return permissions.some(
      p => p.permission_type === permissionType && p.resource === resource
    );
  }, [isSuperAdmin, permissions]);

  return (
    <PermissionContext.Provider value={{
      checkPermission,
      hasPermission,
      permissions,
      loading,
      refreshPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export function usePermissions() {
  const ctx = useContext(PermissionContext);
  if (!ctx) throw new Error('usePermissions must be used within PermissionProvider');
  return ctx;
}

export function useIsSuperAdmin() {
  const { isSuperAdmin } = useAuth();
  return isSuperAdmin;
}

export function useCan(permissionType: string, resource: string) {
  const { hasPermission } = usePermissions();
  const { isSuperAdmin } = useAuth();

  return isSuperAdmin || hasPermission(permissionType, resource);
}
