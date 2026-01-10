import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Complaint {
  id: string;
  created_at: string;
  category: string;
  title: string;
  description: string;
  location: string;
  latitude: number;
  longitude: number;
  status: 'open' | 'in-progress' | 'resolved' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'critical';
  citizen_name: string;
  citizen_phone: string;
  zone: string;
  ward: string;
  assigned_to?: string;
  resolved_at?: string;
  ai_summary?: string;
  sentiment?: string;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity?: number;
}
