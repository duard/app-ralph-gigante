import axios from 'axios';
import { apiClient, post, get } from './client';
import type { User } from '@/stores/auth-store';

/**
 * Login request interface
 */
export interface LoginRequest {
    username: string;
    password: string;
    rememberMe?: boolean;
}

/**
 * Login response interface
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Refresh token request
 */
export interface RefreshRequest {
    refreshToken: string;
}

/**
 * Refresh token response
 */
export interface RefreshResponse {
    success: boolean;
    data: {
        token: string;
        refreshToken: string;
        expiresIn: number;
    };
}

/**
 * Auth service for authentication operations
 */
export const authService = {
    /**
     * Login with username and password
     */
    async login(credentials: LoginRequest): Promise<LoginResponse> {
        return post<LoginResponse>('/auth/login', credentials);
    },

    /**
     * Refresh access token
     */
    async refreshToken(refreshToken: string): Promise<RefreshResponse> {
        const API_BASE_URL = import.meta.env.VITE_SANKHYA_API_URL || '/api';
        return axios.post<RefreshResponse>(`${API_BASE_URL}/auth/refresh`, { refreshToken }, {
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            timeout: 30000,
        }).then(response => response.data);
    },

    /**
     * Logout current user
     */
    async logout(): Promise<void> {
        try {
            await post('/auth/logout');
        } catch (error) {
            // Logout errors are usually not critical
            console.warn('Logout request failed:', error);
        } finally {
            // Always clear local storage
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
        }
    },

    /**
     * Get current user info
     */
    async getMe(): Promise<User> {
        return get<User>('/auth/me');
    },

    /**
     * Check if user is authenticated
     */
    async checkAuth(): Promise<boolean> {
        try {
            await this.getMe();
            return true;
        } catch {
            return false;
        }
    },

    /**
     * Request password reset
     */
    async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
        return post('/auth/forgot-password', { email });
    },

    /**
     * Reset password with token
     */
    async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
        return post('/auth/reset-password', { token, newPassword });
    },

    /**
     * Change current user password
     */
    async changePassword(
        currentPassword: string,
        newPassword: string
    ): Promise<{ success: boolean; message: string }> {
        return post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
    },

    /**
     * Store tokens securely based on rememberMe preference
     * - If rememberMe: store both tokens in localStorage
     * - If not: store access_token in sessionStorage, don't store refreshToken
     */
    storeTokens(token: string, refreshToken: string, rememberMe: boolean): void {
        if (rememberMe) {
            localStorage.setItem('auth_token', token);
            localStorage.setItem('refresh_token', refreshToken);
        } else {
            sessionStorage.setItem('auth_token', token);
            // Don't store refreshToken for security
        }
    },

    /**
     * Get stored tokens from localStorage or sessionStorage
     */
    getStoredTokens(): { token: string | null; refreshToken: string | null } {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token');
        const refreshToken = localStorage.getItem('refresh_token');
        return { token, refreshToken };
    },

    /**
     * Clear stored tokens from both storages
     */
    clearTokens(): void {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        sessionStorage.removeItem('auth_token');
    },

    /**
     * Set auth header for API client
     */
    setAuthHeader(token: string): void {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    },

    /**
     * Clear auth header
     */
    clearAuthHeader(): void {
        delete apiClient.defaults.headers.common['Authorization'];
    },
};

export default authService;
