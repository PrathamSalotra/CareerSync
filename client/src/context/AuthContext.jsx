import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('careersync_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  // Sync state with localStorage
  const updateSessionUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem('careersync_user', JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem('careersync_user');
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await apiClient('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      updateSessionUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setLoading(true);
    try {
      const data = await apiClient('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password },
      });
      updateSessionUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.warn('Logout warning:', err);
    } finally {
      updateSessionUser(null);
    }
  };

  const forgotPassword = async (email) => {
    return await apiClient('/api/auth/forgot-password', {
      method: 'POST',
      body: { email },
    });
  };

  const resetPassword = async (otp, password) => {
    return await apiClient('/api/auth/reset-password', {
      method: 'POST',
      body: { otp, password },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
