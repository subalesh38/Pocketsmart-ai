import { apiClient } from './client';
import { PlanResult } from './plan';

export interface HistoryItem {
  id: string;
  type: 'home' | 'party' | 'jewelry';
  created_at: string;
  total_budget: number;
  allocated: number;
  remaining: number;
  summary: string;
  has_image: boolean;
}

export const historyApi = {
  list: async (limit = 20, offset = 0): Promise<HistoryItem[]> => {
    return apiClient.fetch(`/history?limit=${limit}&offset=${offset}`);
  },

  recent: async (): Promise<HistoryItem[]> => {
    return apiClient.fetch('/history/recent');
  },

  detail: async (id: string): Promise<PlanResult> => {
    return apiClient.fetch(`/history/${id}`);
  },
};
