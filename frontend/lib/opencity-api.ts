/**
 * OpenCity.in CKAN Data API Client
 * 
 * API Documentation: https://data.opencity.in/api/action/datastore_search
 * 
 * This service fetches real Delhi complaint data from OpenCity.in
 */

export interface OpenCityComplaint {
  _id?: number;
  [key: string]: any; // Flexible structure for API response
}

export interface OpenCityApiResponse {
  help: string;
  success: boolean;
  result: {
    resource_id: string;
    fields: Array<{
      type: string;
      id: string;
    }>;
    records: OpenCityComplaint[];
    _links: {
      start: string;
      next: string;
    };
    total?: number;
  };
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    id: string;
    category: string;
    status: string;
    description?: string;
    ward?: string;
    priority: 'critical' | 'moderate' | 'resolved';
    [key: string]: any;
  };
}

export interface GeoJSONCollection {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
}

/**
 * Fetch complaints from OpenCity.in API
 * 
 * @param limit - Maximum number of records to fetch (default: 1000)
 * @param filters - Optional filters object
 * @param query - Optional text search query
 * @returns Promise with GeoJSON FeatureCollection
 */
export async function fetchOpenCityComplaints(
  limit: number = 1000,
  filters?: Record<string, any>,
  query?: string
): Promise<GeoJSONCollection> {
  const API_ENDPOINT = 'https://data.opencity.in/api/action/datastore_search';
  const RESOURCE_ID = 'ed85c3cd-f047-4512-9f2e-11af472202d3';
  
  // Note: API token may be optional for public data
  // If authentication is required, set NEXT_PUBLIC_OPENCITY_API_TOKEN in .env
  const API_TOKEN = process.env.NEXT_PUBLIC_OPENCITY_API_TOKEN || '';

  try {
    const requestBody: any = {
      resource_id: RESOURCE_ID,
      limit: limit,
    };

    if (query) {
      requestBody.q = query;
    }

    if (filters) {
      requestBody.filters = filters;
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (API_TOKEN) {
      headers['Authorization'] = API_TOKEN;
    }

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenCity API error: ${response.status} ${response.statusText}`);
    }

    const data: OpenCityApiResponse = await response.json();

    if (!data.success) {
      throw new Error('OpenCity API returned unsuccessful response');
    }

    // Transform API records to GeoJSON
    const features: GeoJSONFeature[] = data.result.records
      .filter(record => {
        // Filter records that have valid coordinates
        // Adjust field names based on actual API response structure
        const lat = record.latitude || record.lat || record.Latitude || record.LAT;
        const lng = record.longitude || record.lng || record.Longitude || record.LNG;
        return lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng));
      })
      .map(record => {
        const lat = Number(record.latitude || record.lat || record.Latitude || record.LAT);
        const lng = Number(record.longitude || record.lng || record.Longitude || record.LNG);
        
        // Determine priority based on category and status
        const category = record.category || record.Category || record.type || 'Unknown';
        const status = record.status || record.Status || record.state || 'Open';
        
        let priority: 'critical' | 'moderate' | 'resolved' = 'moderate';
        
        // Critical categories
        if (
          ['Garbage', 'Sewage', 'Water Supply', 'Open Manhole', 'Fire Hazard', 'Flooding', 'Emergency']
            .some(crit => category.toLowerCase().includes(crit.toLowerCase()))
        ) {
          priority = 'critical';
        }
        // Resolved status
        else if (
          status.toLowerCase() === 'resolved' ||
          status.toLowerCase() === 'closed' ||
          status.toLowerCase() === 'completed'
        ) {
          priority = 'resolved';
        }

        return {
          type: 'Feature' as const,
          geometry: {
            type: 'Point' as const,
            coordinates: [lng, lat] as [number, number],
          },
          properties: {
            id: record._id?.toString() || record.id?.toString() || Math.random().toString(),
            category: category,
            status: status,
            description: record.description || record.Description || record.complaint || '',
            ward: record.ward || record.Ward || record.zone || '',
            priority: priority,
            // Include all original fields for reference
            ...record,
          },
        };
      });

    return {
      type: 'FeatureCollection',
      features,
    };
  } catch (error) {
    console.error('Error fetching OpenCity complaints:', error);
    // Return empty collection on error
    return {
      type: 'FeatureCollection',
      features: [],
    };
  }
}

/**
 * Split complaints into critical, moderate, and resolved GeoJSON collections
 */
export async function fetchCategorizedComplaints(): Promise<{
  critical: GeoJSONCollection;
  moderate: GeoJSONCollection;
  resolved: GeoJSONCollection;
}> {
  // Fetch all complaints
  const allComplaints = await fetchOpenCityComplaints(2000); // Fetch up to 2000 records

  // Split by priority
  const critical: GeoJSONFeature[] = [];
  const moderate: GeoJSONFeature[] = [];
  const resolved: GeoJSONFeature[] = [];

  allComplaints.features.forEach(feature => {
    if (feature.properties.priority === 'critical') {
      critical.push(feature);
    } else if (feature.properties.priority === 'resolved') {
      resolved.push(feature);
    } else {
      moderate.push(feature);
    }
  });

  return {
    critical: {
      type: 'FeatureCollection',
      features: critical,
    },
    moderate: {
      type: 'FeatureCollection',
      features: moderate,
    },
    resolved: {
      type: 'FeatureCollection',
      features: resolved,
    },
  };
}
