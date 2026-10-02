import { apiClient } from './client';

export interface User {
  id: number;
  username: string;
  email: string;
}

export const authApi = {
  login: async (username: string, password: string): Promise<void> => {
    await apiClient.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  register: async (username: string, email: string, password: string): Promise<User> => {
    return apiClient.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  logout: async (): Promise<void> => {
    await apiClient.fetch('/auth/logout', { method: 'POST' });
  },

  me: async (): Promise<User> => {
    return apiClient.fetch('/auth/me', { method: 'GET' });
  },
};
