// API client for Sampark backend
// This replaces all mock data with real API calls

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface DashboardStats {
  totalComplaints: number;
  resolvedToday: number;
  avgResolutionTime: string;
  liveAgents: number;
  complaintTrend: number;
  resolutionTrend: number;
}

export interface Activity {
  id: string;
  type: 'complaint' | 'resolved' | 'escalated' | 'assigned';
  title: string;
  location: string;
  time: string;
  zone?: string;
}

export interface ZoneStats {
  zone: string;
  total_complaints: number;
  open_complaints: number;
  resolved_today: number;
  avg_resolution_hours: number;
  active_agents: number;
}

// Fetch dashboard statistics
export async function fetchDashboardStats(zone?: string): Promise<DashboardStats> {
  try {
    const url = zone && zone !== 'all' 
      ? `${API_BASE}/api/dashboard-stats?zone=${zone}`
      : `${API_BASE}/api/dashboard-stats`;
    
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch stats');
    
    const data = await res.json();
    
    return {
      totalComplaints: data.total_complaints || 0,
      resolvedToday: data.resolved || 0,
      avgResolutionTime: `${(data.avg_resolution_hours || 4.2).toFixed(1)}h`,
      liveAgents: data.active_agents || 0,
      complaintTrend: data.complaint_trend || 0,
      resolutionTrend: data.resolution_trend || 0,
    };
  } catch (error) {
    console.error('Dashboard stats error:', error);
    // Return zeros instead of fake data
    return {
      totalComplaints: 0,
      resolvedToday: 0,
      avgResolutionTime: '0h',
      liveAgents: 0,
      complaintTrend: 0,
      resolutionTrend: 0,
    };
  }
}

// Fetch recent activity
export async function fetchRecentActivity(zone?: string, limit = 5): Promise<Activity[]> {
  try {
    const params = new URLSearchParams({ limit: String(limit) });
    if (zone && zone !== 'all') params.append('zone', zone);
    
    const res = await fetch(`${API_BASE}/api/activity?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch activity');
    
    const data = await res.json();
    
    return (data.activities || []).map((item: any) => ({
      id: item.id,
      type: item.type,
      title: item.title,
      location: item.location || 'Unknown',
      time: formatRelativeTime(item.created_at),
      zone: item.zone,
    }));
  } catch (error) {
    console.error('Activity fetch error:', error);
    return [];
  }
}

// Fetch zone-specific stats
export async function fetchZoneStats(zone: string): Promise<ZoneStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/zones/${zone}/stats`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch zone stats');
    return await res.json();
  } catch (error) {
    console.error('Zone stats error:', error);
    return null;
  }
}

// Fetch complaints for inbox
export async function fetchComplaints(options: {
  zone?: string;
  status?: string;
  limit?: number;
  search?: string;
} = {}) {
  try {
    const params = new URLSearchParams();
    if (options.zone && options.zone !== 'all') params.append('zone', options.zone);
    if (options.status && options.status !== 'all') params.append('status', options.status);
    if (options.limit) params.append('limit', String(options.limit));
    if (options.search) params.append('search', options.search);
    
    const res = await fetch(`${API_BASE}/api/complaints?${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch complaints');
    
    const data = await res.json();
    return data.complaints || [];
  } catch (error) {
    console.error('Complaints fetch error:', error);
    return [];
  }
}

// Fetch heatmap points
export async function fetchHeatmapPoints(zone?: string) {
  try {
    const params = zone && zone !== 'all' ? `?zone=${zone}` : '';
    const res = await fetch(`${API_BASE}/api/heatmap${params}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch heatmap');
    
    const data = await res.json();
    return data.points || [];
  } catch (error) {
    console.error('Heatmap fetch error:', error);
    return [];
  }
}

// Get Vapi config
export async function fetchVapiConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (!res.ok) throw new Error('Failed to fetch config');
    return await res.json();
  } catch {
    // Fallback to env vars
    return {
      vapi_public_key: process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY || '',
      vapi_assistant_id: process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || '',
    };
  }
}

// Create a new complaint
export async function createComplaint(complaint: {
  category: string;
  description: string;
  location: string;
  zone?: string;
  caller_phone?: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE}/api/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(complaint),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to create complaint');
  }
  
  return await res.json();
}

// Update complaint status
export async function updateComplaint(complaintNumber: string, updates: {
  status?: string;
  assigned_to?: string;
  notes?: string;
  priority?: string;
}) {
  const res = await fetch(`${API_BASE}/api/complaints/${complaintNumber}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to update complaint');
  }
  
  return await res.json();
}

// Helper: Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
}
