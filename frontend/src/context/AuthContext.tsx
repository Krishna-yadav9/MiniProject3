import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi, getStoredToken } from '../api/client';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role?: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('apex_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() => {
    return getStoredToken();
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validate session on token change or initial load
  useEffect(() => {
    const activeToken = getStoredToken();
    if (activeToken && !user) {
      authApi.me(activeToken)
        .then(u => {
          setUser(u);
          localStorage.setItem('apex_user', JSON.stringify(u));
        })
        .catch((err) => {
          console.warn('Session check failed, clearing stored token:', err);
          logout();
        });
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login(email, password);
      const cleanToken = response.token.replace(/^Bearer\s+/i, '').trim();

      setToken(cleanToken);
      localStorage.setItem('apex_jwt_token', cleanToken);

      const userProfile: User = {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
      };
      setUser(userProfile);
      localStorage.setItem('apex_user', JSON.stringify(userProfile));
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string, role?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register(email, password, name, role);
      const cleanToken = response.token.replace(/^Bearer\s+/i, '').trim();

      setToken(cleanToken);
      localStorage.setItem('apex_jwt_token', cleanToken);

      const userProfile: User = {
        id: response.id,
        email: response.email,
        name: response.name,
        role: response.role,
      };
      setUser(userProfile);
      localStorage.setItem('apex_user', JSON.stringify(userProfile));
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('apex_jwt_token');
    localStorage.removeItem('apex_user');
  };

  const clearError = () => setError(null);

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
