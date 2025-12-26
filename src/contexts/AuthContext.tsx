import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import api from '@/lib/api';
import { User } from '@/lib/types';

interface AuthState {
  admin: User | null;
  permissions: string[];
  loading: boolean;
  login: (payload: { username: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (required: string | string[]) => boolean;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [admin, setAdmin] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const userData = await api.auth.me();
      setAdmin(userData);
      setPermissions(userData.permissions ?? []);
      localStorage.setItem('admin_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Failed to load profile:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_user');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('access_token')) {
      loadProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload: { username: string; password: string }) => {
    const res = await api.auth.login(payload);
    const { access_token, refresh_token, user } = res;

    localStorage.setItem('access_token', access_token);
    localStorage.setItem('refresh_token', refresh_token);
    localStorage.setItem('admin_user', JSON.stringify(user));

    setAdmin(user);
    setPermissions(user?.permissions ?? []);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('admin_user');
      setAdmin(null);
      setPermissions([]);
    }
  };

  const hasPermission = useCallback((required: string | string[]): boolean => {
    const requiredList = Array.isArray(required) ? required : [required];
    return requiredList.some(
      (perm) => permissions.includes('*') || permissions.includes(perm)
    );
  }, [permissions]);

  return (
    <AuthContext.Provider value={{ admin, permissions, loading, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
