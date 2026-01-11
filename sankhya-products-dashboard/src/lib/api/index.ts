// API Client exports
export { apiClient, get, post, put, patch, del, withRetry } from './client';
export type { ApiRequestConfig } from './client';

// Service exports
export { authService } from './auth-service';
export type { LoginRequest, LoginResponse, RefreshRequest, RefreshResponse } from './auth-service';

export { productService } from './product-service';
export type { ProductPayload, ProductSearchParams } from './product-service';
