"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { account } from '@/utils/appwrite';
import { ID } from 'appwrite';
import { toast } from 'sonner';

interface User {
  userId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const accountDetails = await account.get();
        setUser({
          userId: accountDetails.$id,
          name: accountDetails.name,
          email: accountDetails.email
        });
      } catch (error) {
        // User is not logged in
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      // Create session directly with Appwrite
      await account.createEmailPasswordSession(email, password);
      const accountDetails = await account.get();
      
      setUser({
        userId: accountDetails.$id,
        name: accountDetails.name,
        email: accountDetails.email
      });
      
      toast.success('Logged in successfully!');
    } catch (error: any) {
      console.error('Login failed:', error);
      toast.error(error.message || 'Login failed. Please check your credentials.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      // Create account directly with Appwrite
      await account.create(ID.unique(), email, password, name);
      // Immediately create session after signup
      await account.createEmailPasswordSession(email, password);
      
      const accountDetails = await account.get();
      setUser({
        userId: accountDetails.$id,
        name: accountDetails.name,
        email: accountDetails.email
      });
      
      toast.success('Account created successfully!');
    } catch (error: any) {
      console.error('Sign up failed:', error);
      toast.error(error.message || 'Sign up failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession('current');
      setUser(null);
      toast.success('Logged out successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Logout failed.');
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 