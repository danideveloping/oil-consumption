import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  isSuperAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored token on app start
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.login(username, password);
      
      if (response.data.token && response.data.user) {
        const { token: authToken, user: userData } = response.data;
        
        setToken(authToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Login successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authAPI.register(username, password);
      
      if (response.data.token && response.data.user) {
        const { token: authToken, user: userData } = response.data;
        
        setToken(authToken);
        setUser(userData);
        
        // Store in localStorage
        localStorage.setItem('token', authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        
        toast.success('Registration successful!');
        return true;
      }
      return false;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
  };

  const isSuperAdmin = (): boolean => {
    return user?.role === 'superadmin';
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isSuperAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 