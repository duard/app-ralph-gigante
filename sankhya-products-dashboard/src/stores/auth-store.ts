import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * User interface
 */
export interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    avatarUrl?: string;
    role: string;
    permissions?: string[];
    createdAt?: string;
    updatedAt?: string;
}

/**
 * Authentication state
 */
interface AuthState {
    // State
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Actions
    setUser: (user: User | null) => void;
    setTokens: (token: string, refreshToken: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    login: (user: User, token: string, refreshToken: string) => void;
    logout: () => void;
    clearError: () => void;
}

/**
 * Auth store with persistence
 */
export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            // Initial state
            user: null,
            token: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            // Actions
            setUser: (user) =>
                set({
                    user,
                    isAuthenticated: !!user,
                }),

            setTokens: (token, refreshToken) =>
                set({
                    token,
                    refreshToken,
                }),

            setLoading: (isLoading) => set({ isLoading }),

            setError: (error) => set({ error, isLoading: false }),

            login: (user, token, refreshToken) =>
                set({
                    user,
                    token,
                    refreshToken,
                    isAuthenticated: true,
                    isLoading: false,
                    error: null,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    refreshToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                }),

            clearError: () => set({ error: null }),
        }),
        {
            name: 'auth-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                refreshToken: state.refreshToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
