export interface Listing {
  id: number;
  title: string;
  description: string;
  property_type: string;
  sub_market: string;
  city: string;
  state: string;
  square_footage: number;
  price_per_sf?: number;
  image_url?: string;
  broker_id: string;
  is_active: boolean;
}

export interface MatchResult {
  id: number;
  match_score: number;
  listing: Listing;
}

export interface IngestionPayload {
  source: string;
  content: string;
}

export interface TenantDemand {
  query: string;
  source?: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
const DEFAULT_TIMEOUT_MS = 8000;

/**
 * Helper to fetch with timeout
 */
async function fetchWithTimeout(resource: string, options: RequestInit & { timeout?: number } = {}) {
  const { timeout = DEFAULT_TIMEOUT_MS } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeout}ms`);
    }
    throw error;
  }
}

export async function fetchListings(skip = 0, limit = 100): Promise<ApiResponse<Listing[]>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/listings/?skip=${skip}&limit=${limit}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error: any) {
    console.error('Error fetching listings:', error);
    return { data: [], error: error.message || 'Failed to fetch listings', status: 500 };
  }
}

export async function matchDemand(demand: TenantDemand): Promise<ApiResponse<MatchResult[]>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/demand/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: demand.query,
        source: demand.source || 'direct'
      }),
      timeout: 10000 // Vector search might take slightly longer
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error: any) {
    console.error('Error matching demand:', error);
    return { data: [], error: error.message || 'Failed to match demand', status: 500 };
  }
}

export async function ingestLead(payload: IngestionPayload): Promise<ApiResponse<{status: string, message: string}>> {
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}/webhooks/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    const data = await response.json();
    return { data, error: null, status: response.status };
  } catch (error: any) {
    console.error('Error ingesting lead:', error);
    return { data: null, error: error.message || 'Failed to submit requirements', status: 500 };
  }
}
