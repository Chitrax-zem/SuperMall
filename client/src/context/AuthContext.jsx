import { createContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api, { authAPI } from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // admin profile
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // global auth loading

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const res = await authAPI.getCurrentUser();
      const profile = res?.data?.data || null;
      if (profile) {
        setUser(profile);
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // supports login({email, password}) or login(email, password)
  const login = async (credentials) => {
    const payload =
      typeof credentials === 'object'
        ? credentials
        : { email: arguments[0], password: arguments[1] };

    try {
      setLoading(true);

      // 1) Login
      const res = await authAPI.login(payload);
      const root = res?.data || {};
      const dataNode = root?.data || {};
      const token = dataNode?.token || root?.token;
      const adminFromLogin = dataNode?.admin || root?.user;

      if (!token) throw new Error('Missing token in login response');

      localStorage.setItem('token', token);

      // 2) Verify token with profile endpoint
      const profileRes = await authAPI.getCurrentUser();
      const profile = profileRes?.data?.data || adminFromLogin || null;
      if (!profile) throw new Error('Unable to load admin profile');

      setUser(profile);
      setIsAuthenticated(true);
      toast.success('Login successful!');
      return { success: true };
    } catch (error) {
      const message =
        error?.response?.data?.message || error?.message || 'Login failed';
      toast.error(message);
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (e) {
      // ignore server error; still clear local
    } finally {
      localStorage.removeItem('token');
      setUser(null);
      setIsAuthenticated(false);
      toast.success('Logged out successfully');
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, loading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
