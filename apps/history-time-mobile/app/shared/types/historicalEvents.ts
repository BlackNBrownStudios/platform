/**
 * Types for historical events service
 * Shared between web and mobile platforms
 */

export type EventSignificance = 'low' | 'medium' | 'high' | 'pivotal';

export interface EventSource {
  name: string;
  url: string;
  retrievalDate?: Date;
}

export interface HistoricalEvent {
  id: string;
  title: string;
  description: string;
  year: number;
  month?: number;
  day?: number;
  date?: Date;
  category: string;
  subcategory?: string;
  tags?: string[];
  significance: EventSignificance;
  imageUrl?: string;
  sources: EventSource[];
  verified: boolean;
  dateCreated: Date;
  dateUpdated: Date;
}

export interface EventFilters {
  category?: string;
  categories?: string[];
  startYear?: number;
  endYear?: number;
  significance?: EventSignificance | string;
  tags?: string[];
  searchTerm?: string;
  verified?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  minRequired?: number;
}

export interface EventsResponse {
  results: HistoricalEvent[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}
