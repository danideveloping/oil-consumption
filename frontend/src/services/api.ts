import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: 'https://oil-consumption.onrender.com/oil/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token from localStorage:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📤 Request headers:', config.headers);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface Place {
  id: number;
  name: string;
  location?: string;
  description?: string;
  created_at: string;
}

export interface Machinery {
  id: number;
  name: string;
  type?: string;
  place_id: number;
  place_name?: string;
  place_location?: string;
  capacity: number;
  description?: string;
  created_at: string;
}

export interface OilData {
  id: number;
  machinery_id: number;
  machinery_name: string;
  machinery_type: string;
  place_name?: string;
  place_location?: string;
  date: string;
  litres: number;
  type: 'consumption' | 'refill' | 'maintenance';
  notes?: string;
  created_at: string;
}

export interface DailyData {
  date: string;
  machinery_id: number;
  machinery_name: string;
  machinery_type: string;
  place_name?: string;
  total_litres: number;
  record_count: number;
  type: string;
}

export interface MonthlyData {
  month: string;
  machinery_id: number;
  machinery_name: string;
  machinery_type: string;
  place_name?: string;
  total_litres: number;
  record_count: number;
  avg_daily_litres: number;
  type: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_records: number;
    per_page: number;
  };
}

// Authentication API
export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (username: string, email: string, password: string) =>
    api.post('/auth/register', { username, email, password }),
};

// Places API
export const placesAPI = {
  getAll: () => api.get<Place[]>('/places'),
  
  getById: (id: number) => api.get<Place>(`/places/${id}`),
  
  create: (data: Omit<Place, 'id' | 'created_at'>) =>
    api.post<Place>('/places', data),
  
  update: (id: number, data: Partial<Omit<Place, 'id' | 'created_at'>>) =>
    api.put<Place>(`/places/${id}`, data),
  
  delete: (id: number) => api.delete(`/places/${id}`),
  
  getMachinery: (id: number) => api.get<Machinery[]>(`/places/${id}/machinery`),
};

// Machinery API
export const machineryAPI = {
  getAll: () => api.get<Machinery[]>('/machinery'),
  
  getById: (id: number) => api.get<Machinery>(`/machinery/${id}`),
  
  create: (data: Omit<Machinery, 'id' | 'created_at' | 'place_name' | 'place_location'>) =>
    api.post<Machinery>('/machinery', data),
  
  update: (id: number, data: Partial<Omit<Machinery, 'id' | 'created_at' | 'place_name' | 'place_location'>>) =>
    api.put<Machinery>(`/machinery/${id}`, data),
  
  delete: (id: number) => api.delete(`/machinery/${id}`),
};

// Oil Data API
export const dataAPI = {
  getAll: (params?: {
    page?: number;
    limit?: number;
    machinery_id?: number;
    start_date?: string;
    end_date?: string;
    type?: string;
    year?: string;
    month?: string;
  }) => api.get<PaginatedResponse<OilData>>('/data', { params }),
  
  getDaily: (params?: {
    date?: string;
    machinery_id?: number;
  }) => api.get<DailyData[]>('/data/daily', { params }),
  
  getMonthly: (params?: {
    year?: string;
    month?: string;
    machinery_id?: number;
  }) => api.get<MonthlyData[]>('/data/monthly', { params }),
  
  create: (data: Omit<OilData, 'id' | 'created_at' | 'machinery_name' | 'machinery_type' | 'place_name' | 'place_location'>) =>
    api.post<OilData>('/data', data),
  
  update: (id: number, data: Partial<Omit<OilData, 'id' | 'created_at' | 'machinery_name' | 'machinery_type' | 'place_name' | 'place_location'>>) =>
    api.put<OilData>(`/data/${id}`, data),
  
  delete: (id: number) => api.delete(`/data/${id}`),
  
  getTankAnalysis: (machineryId: number, params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get(`/data/tank-analysis/${machineryId}`, { params }),
  
  getCentralTankAnalysis: (params?: {
    start_date?: string;
    end_date?: string;
  }) => api.get('/data/central-tank-analysis', { params }),
};

export default api; 