import { createContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await authApi.getMe();
      setProfile(data);
      setUser(data.user);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
      // If it's a 401, clear local storage
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  const login = async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    await fetchProfile();
    return data;
  };

  const register = async (formData) => {
    const { data } = await authApi.register(formData);
    localStorage.setItem('access_token', data.tokens.access);
    localStorage.setItem('refresh_token', data.tokens.refresh);
    setUser(data.user);
    setIsAuthenticated(true);
    await fetchProfile();
    return data;
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) await authApi.logout(refresh);
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setUser(null);
      setProfile(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user, profile, loading, isAuthenticated,
      login, register, logout, fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
