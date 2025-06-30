import { apiRequest } from './queryClient';

export interface AuthStatus {
  authenticated: boolean;
}

export const login = async (secretKey: string): Promise<{ success: boolean; message: string }> => {
  const response = await apiRequest('POST', '/api/login', { secretKey });
  return response.json();
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await apiRequest('POST', '/api/logout');
  return response.json();
};

export const checkAuthStatus = async (): Promise<AuthStatus> => {
  try {
    const response = await fetch('/api/auth/status', {
      credentials: 'include',
    });
    return response.json();
  } catch (error) {
    return { authenticated: false };
  }
};
