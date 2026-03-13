import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { apiFetch } from '../api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, username: string, name: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => Promise<boolean>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load current user from localStorage
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Ensure name field is set from first_name and last_name if not already set
      if (!user.name && (user.first_name || user.last_name)) {
        user.name = [user.first_name, user.last_name].filter(Boolean).join(' ');
      }
      setUser(user);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log('[Login] Attempting to login with email:', email);
      const tokenResponse = await apiFetch<{ access_token: string; token_type: string; user_id: number }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );

      console.log('[Login] Token response:', tokenResponse);
      const token = tokenResponse.access_token;

      console.log('[Login] Fetching user data...');
      const user = await apiFetch<User>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('[Login] User data received:', user);
      // Combine first_name and last_name into name field
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      const userWithToken = { ...user, token, name: fullName };
      setUser(userWithToken);
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      console.log('[Login] Login successful');
      return true;
    } catch (error) {
      console.error('[Login] Login failed:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, username: string, name: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const [firstName, lastName] = name.split(' ').length > 1 
        ? name.split(' ', 2) 
        : [name, ''];
      
      const user = await apiFetch<User>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ 
          email, 
          password, 
          username,
          first_name: firstName, 
          last_name: lastName 
        }),
      });

      // Auto-login after register
      const tokenResponse = await apiFetch<{ access_token: string; token_type: string; user_id: number }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({ email, password }),
        }
      );
      const token = tokenResponse.access_token;

      // Combine first_name and last_name into name field
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ');
      const userWithToken = { ...user, token, name: fullName };
      setUser(userWithToken);
      localStorage.setItem('currentUser', JSON.stringify(userWithToken));
      return { success: true };
    } catch (error: any) {
      console.error('Register failed', error);
      const errorMessage = error?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateUser = async (updates: Partial<User>): Promise<boolean> => {
    if (!user) return false;

    try {
      // If name is being updated, split it into first_name and last_name
      const backendUpdates: any = { ...updates };
      if (updates.name) {
        const [firstName, lastName] = updates.name.split(' ').length > 1 
          ? updates.name.split(' ', 2) 
          : [updates.name, ''];
        backendUpdates.first_name = firstName;
        backendUpdates.last_name = lastName;
        delete backendUpdates.name; // Remove name field, backend expects first_name and last_name
      }

      const updatedUser = await apiFetch<User>(
        '/auth/me',
        {
          method: 'PUT',
          body: JSON.stringify(backendUpdates),
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
        user.token
      );

      // Combine first_name and last_name into name field
      const fullName = [updatedUser.first_name, updatedUser.last_name].filter(Boolean).join(' ');
      const updatedUserWithToken = { ...updatedUser, token: user.token, name: fullName };
      setUser(updatedUserWithToken);
      localStorage.setItem('currentUser', JSON.stringify(updatedUserWithToken));
      return true;
    } catch (error) {
      console.error('Update user failed', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateUser,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
