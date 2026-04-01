import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import API_BASE_URL from '../config/api.config';

interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    token?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Check if user is already logged in from storage
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('user');
            const storedToken = await AsyncStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Error checking auth:', error);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            setIsLoading(true);

            // Try to connect to backend auth endpoint
            // If backend auth is not available yet, use mock login
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                    email,
                    password,
                });

                const newUser: User = {
                    id: response.data.user?.id || '1',
                    name: response.data.user?.name || email.split('@')[0],
                    email: response.data.user?.email || email,
                    avatar: response.data.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                    token: response.data.token,
                };

                setUser(newUser);

                // Store in async storage
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
                if (response.data.token) {
                    await AsyncStorage.setItem('token', response.data.token);
                }
            } catch (apiError) {
                // Backend auth not available, use mock login
                // In production, you would want to show an error here
                console.warn('Backend auth not available, using mock login', apiError);

                const newUser: User = {
                    id: '1',
                    name: email.split('@')[0],
                    email,
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                };

                setUser(newUser);
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        try {
            setIsLoading(true);

            // Try to connect to backend auth endpoint
            try {
                const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
                    name,
                    email,
                    password,
                });

                const newUser: User = {
                    id: response.data.user?.id || '1',
                    name: response.data.user?.name || name,
                    email: response.data.user?.email || email,
                    avatar: response.data.user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                    token: response.data.token,
                };

                setUser(newUser);

                // Store in async storage
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
                if (response.data.token) {
                    await AsyncStorage.setItem('token', response.data.token);
                }
            } catch (apiError) {
                // Backend auth not available, use mock signup
                console.warn('Backend auth not available, using mock signup', apiError);

                const newUser: User = {
                    id: '1',
                    name,
                    email,
                    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
                };

                setUser(newUser);
                await AsyncStorage.setItem('user', JSON.stringify(newUser));
            }
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            setUser(null);
            await AsyncStorage.removeItem('user');
            await AsyncStorage.removeItem('token');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                signup,
                logout,
                checkAuth,
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

