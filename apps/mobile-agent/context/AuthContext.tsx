import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useSegments } from 'expo-router';
import { Platform } from 'react-native'; 

interface AuthContextType {
  user: any;
  isLoading: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();


  const saveItem = async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  };

  const getItem = async (key: string) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  };

  const deleteItem = async (key: string) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  };
  // ---------------------------------------------

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await getItem('accessToken');
        const userData = await getItem('userData');
        
        if (token && userData) {
          setUser(JSON.parse(userData));
        }
      } catch (e) {
        console.error('Lỗi lấy token:', e);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const login = async (token: string, userData: any) => {
    await saveItem('accessToken', token);
    await saveItem('userData', JSON.stringify(userData));
    setUser(userData);
    router.replace('/(tabs)');
  };

  const logout = async () => {
    await deleteItem('accessToken');
    await deleteItem('userData');
    setUser(null);
    router.replace('/login');
  };

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(tabs)';
    
    if (!user && inAuthGroup) {
      router.replace('/login');
    } else if (user && segments[0] === 'login') {
      router.replace('/(tabs)');
    }
  }, [user, segments, isLoading]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};