export type PlannerType = 'home' | 'party' | 'jewelry';

export type BudgetStatus = 'within' | 'near' | 'over';

export type ShoppingPlatformName =
  | 'Amazon'
  | 'Flipkart'
  | 'IKEA'
  | 'Myntra'
  | 'Ajio'
  | 'Pepperfry'
  | 'Urban Ladder'
  | 'CaratLane'
  | 'Tanishq'
  | 'Mia by Tanishq'
  | 'Zomato Caterers'
  | 'Ferns N Petals'
  | 'WedMeGood'
  | 'BookMyEvent';

export interface BudgetItem {
  id: string;
  name: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  percentage: number;
}

export interface ProductRecommendation {
  id: string;
  plannerType: PlannerType;
  category: string;
  itemType?: string; // e.g. 'Bulb', 'Fan', 'Chair', 'Table', 'Bracelet', 'Ring', 'Necklace', 'Earrings', 'Watch', 'Venue', 'Catering'
  name: string;
  description?: string;
  platform: ShoppingPlatformName;
  platforms?: ShoppingPlatformName[];
  price: number;
  originalPrice?: number;
  quantity?: number;
  imageUrl?: string;
  aiMatchScore: number;
  styleMatch: string;
  budgetStatus: BudgetStatus;
  attributes: Record<string, string>;
  aiReasoning: string;
  isAddedToPlan?: boolean;
}

export interface HomeFixtureItem {
  id: string;
  name: string;
  quantity: number;
  room?: string;
}

export interface OutfitAnalysisResult {
  colors: string[];
  colorHexes: string[];
  style: string;
  formality: string;
  suggestedMetals: string[];
}

export interface PlanRecord {
  id: string;
  title: string;
  type: PlannerType;
  createdAt: string;
  totalBudget: number;
  allocatedBudget: number;
  estimatedTotal: number;
  status: 'In Progress' | 'Finalized' | 'Completed';
  location?: string;
  categories: {
    name: string;
    percentage: number;
    amount: number;
  }[];
  selectedItems: ProductRecommendation[];
  preferences: Record<string, any>;
  outfitAnalysis?: OutfitAnalysisResult;
  outfitImage?: string;
}

export interface UserProfile {
  username: string;
  name?: string;
  email: string;
  city?: string;
  currency?: 'INR';
  budgetSafetyBuffer?: number;
  theme?: 'light' | 'system';
  avatarUrl?: string;
}
