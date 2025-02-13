// src/context/AuthContext.tsx

import { useNavigation } from '@react-navigation/native';
import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Alert } from 'react-native';

import { Paths } from '@/navigation/paths';

import { storage } from '@/App';
import { API } from '@/services/implementations/api/API';

interface AuthContextProps {
  user: any | null;
  setUser: (user: any | null) => void;
  demographic: any | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    user_type: string,
    profile_photo: string
  ) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({
  user: null,
  setUser: () => {},
  demographic: null,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [demographic, setDemographic] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation();
  const api = new API();
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const access_token = storage.getString('access_token');
        const user_id = storage.getNumber('user_id');
        console.log('access_token', access_token);
        console.log('user_id', user_id);

        if (access_token && user_id) {
          // Fetch user data
          const fetchedUser = await api.user.getUser();
          console.log('fetchedUser', fetchedUser);

          if (fetchedUser) {
            setUser(fetchedUser);

            // Fetch demographic data
            try {
              const fetchedDemographic = await api.user.getDemographic();
              console.log('getDemographic', fetchedDemographic);
              if (fetchedDemographic) {
                setDemographic(fetchedDemographic);
                navigation.reset({
                  index: 0,
                  routes: [{ name: Paths.Home as never }],
                });
                // Navigate to Home
                // Navigation is handled in ApplicationNavigator based on context
              } else {
                navigation.reset({
                  index: 0,
                  routes: [{ name: Paths.Onboarding as never }],
                });
                // Navigate to Onboarding
                // Handled in ApplicationNavigator
              }
            } catch (error) {
              console.log('demopraphic error', error);
              navigation.reset({
                index: 0,
                routes: [{ name: Paths.Onboarding as never }],
              });
            }
          } else {
            // Tokens invalid or user not found, navigate to Register
            /*      await storage.delete('access_token');
            await storage.delete('user_id'); */
            setUser(null);
            setDemographic(null);
            navigation.reset({
              index: 0,
              routes: [{ name: Paths.Splash as never }],
            });
          }
        } else {
          // No tokens, navigate to Register
          setUser(null);
          setDemographic(null);
          navigation.reset({
            index: 0,
            routes: [{ name: Paths.Splash as never }],
          });
        }
      } catch (error: any) {
        console.error('Auth Initialization Error:', error);
        Alert.alert('Hata', error.message || 'Bir hata oluştu.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.user.login(email, password);
      setUser(response);
      // After login, fetch demographic
      const fetchedDemographic = await api.user.getDemographic();
      if (fetchedDemographic) {
        setDemographic(fetchedDemographic);
      } else {
        setDemographic(null);
      }
    } catch (error: any) {
      Alert.alert('Giriş Hatası', error.message || 'Giriş başarısız.');
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    user_type: string,
    profile_photo: string
  ) => {
    try {
      const response = await api.user.register(
        email,
        password,
        name,
        user_type,
        profile_photo
      );
      setUser(response);
      // After registration, navigate to Onboarding
      setDemographic(null);
    } catch (error: any) {
      Alert.alert('Kayıt Hatası', error.message || 'Kayıt başarısız.');
    }
  };

  const logout = async () => {
    await storage.delete('access_token');
    await storage.delete('user_id');
    setUser(null);
    setDemographic(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, demographic, isLoading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    console.warn('useAuth must be used within an AuthProvider');
    return null; // Hata atmak yerine `null` döndürüyoruz.
  }

  return context;
};
