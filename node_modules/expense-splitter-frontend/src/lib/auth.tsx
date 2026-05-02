import { api } from './api';
import type { User } from './types';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface AuthResponse extends User {
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<AuthResponse>;
  signup: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const STORAGE_KEY = 'expense-splitter-user';

function getStoredUser(): User | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

function storeUser(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getStoredUser());
  }, []);

  const login = async (username: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { username, password });
    storeUser(response.data);
    setUser(response.data);
    return response.data;
  };

  const signup = async (username: string, email: string, password: string) => {
    await api.post('/auth/register', { username, email, password });
    const user = await login(username, password);
    return user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, login, signup, logout }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function RequireAuth({ children }: Readonly<{ children: JSX.Element }>) {
  const auth = useAuth();
  if (!auth.user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
