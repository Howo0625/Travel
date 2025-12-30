export interface Message {
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

export interface TransportOption {
  type: string;
  route: string;
  duration: string;
  cost: string;
  details: string;
  recommendationScore: number;
  isRecommended: boolean;
  bookingLink?: string;
}

export interface Accommodation {
  name: string;
  type: string;
  pricePerNight: string;
  rating: string;
  location: string;
  pros: string[];
  cons: string[];
  reason: string;
}

export interface Activity {
  time: string;
  placeName: string;
  description: string;
  transportToNext?: string;
  googleMapsLink?: string;
  ticketLink?: string;
  type: 'sightseeing' | 'food' | 'transport' | 'rest';
}

export interface DayPlan {
  day: number;
  date: string;
  city: string;
  theme?: string;
  activities: Activity[];
}

export interface Expense {
  id: string;
  category: 'Food' | 'Transport' | 'Accommodation' | 'Shopping' | 'Tickets' | 'Other';
  amount: number;
  currency: string;
  description: string;
  date: string;
}

export interface TravelPlan {
  id: string; // Unique ID for saving multiple plans
  createdAt: number;
  title: string;
  destinations: string[];
  dates: string;
  summary: string;
  transportOptions: TransportOption[];
  accommodations: Accommodation[];
  days: DayPlan[];
  tips: string[];
  expenses: Expense[]; // New budget feature
  currencyCode?: string; // e.g., TWD, JPY
}

export type Tab = 'chat' | 'plan' | 'budget'; // Added budget tab
