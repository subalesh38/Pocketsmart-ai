import { apiClient } from './client';

export interface TierPrices {
  budget: number;
  balanced: number;
  premium: number;
}

export interface PlanLink {
  platform: string;
  url: string;
}

export interface PlanItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  priority: number;
  tier_prices: TierPrices;
  reason: string;
  search_terms: string;
  tier: 'budget' | 'balanced' | 'premium';
  line_total?: number;
  source_type: 'ai' | 'demo';
  links: PlanLink[];
  match_score?: number;
}

export interface CategoryTotal {
  category: string;
  allocated: number;
  percent_of_budget: number;
}

export interface PlanResult {
  plan_id: string;
  total_budget: number;
  allocated: number;
  remaining: number;
  categories: CategoryTotal[];
  items: PlanItem[];
  checklist?: Array<{ task: string; time: string }>;
  outfit_analysis?: { colors: string[]; style: string; formality: string };
  guests?: number;
  per_guest_cost?: number;
  contingency?: number;
}

export const planApi = {
  createHomePlan: async (payload: {
    total_budget: number;
    rooms: string;
    lights?: number;
    fans?: number;
    furniture?: number;
    dining_tables?: number;
    notes?: string;
  }): Promise<PlanResult> => {
    return apiClient.fetch('/plan/home', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  recalculate: async (planId: string, itemId: string, tier: string): Promise<PlanResult> => {
    return apiClient.fetch(`/plan/${planId}/recalculate`, {
      method: 'POST',
      body: JSON.stringify({ item_id: itemId, tier }),
    });
  },

  createPartyPlan: async (payload: {
    total_budget: number;
    guests: number;
    party_type: string;
    venue_type: string;
    needs: string;
    notes?: string;
  }): Promise<PlanResult> => {
    return apiClient.fetch('/plan/party', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  createJewelryPlan: async (payload: {
    total_budget: number;
    occasion: string;
    preferences: string;
    notes?: string;
    image?: File;
  }): Promise<PlanResult> => {
    const form = new FormData();
    form.append('total_budget', String(payload.total_budget));
    form.append('occasion', payload.occasion);
    form.append('preferences', payload.preferences);
    if (payload.notes) form.append('notes', payload.notes);
    if (payload.image) form.append('image', payload.image);
    return apiClient.fetchMultipart('/plan/jewelry', form);
  },
};
