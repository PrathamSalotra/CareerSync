import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient('/api/account/me');
        setUser(response.user);
      } catch (err) {
        console.error('Failed to load profile in context:', err);
      } finally {
        setLoadingUser(false);
      }
    };
    fetchProfile();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, loadingUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
